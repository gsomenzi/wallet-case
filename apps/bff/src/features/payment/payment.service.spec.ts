import { NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { MetricRecorder } from "../../infrastructure/observability/metric-recorder/metric-recorder.interface";
import { TraceInstrumenter } from "../../infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import { PaymentStorage } from "../../infrastructure/persistence/payment-storage/payment-storage.interface";
import { PaymentService } from "./payment.service";
import { PaymentRequest } from "./payment-request.dto";
import { PaymentResponse, PaymentStatus } from "./payment-response.entity";
import { PaymentWorkflowEvent } from "./payment-workflow.events";

describe("PaymentService", () => {
    let service: PaymentService;
    let testingModule: TestingModule;
    let paymentStorage: { save: jest.Mock; findByTransactionId: jest.Mock };
    let eventEmitter: { emit: jest.Mock };

    beforeEach(async () => {
        testingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                {
                    provide: PaymentStorage,
                    useValue: {
                        save: jest.fn().mockResolvedValue(undefined),
                        findByTransactionId: jest.fn().mockResolvedValue(null),
                    },
                },
                {
                    provide: TraceInstrumenter,
                    useValue: {
                        usingSpan: jest
                            .fn()
                            .mockImplementation(
                                async (_name: string, _attributes: object, callback: () => Promise<unknown>) =>
                                    callback()
                            ),
                    },
                },
                {
                    provide: MetricRecorder,
                    useValue: {
                        recordHistogram: jest.fn(),
                        incrementCounter: jest.fn(),
                    },
                },
                {
                    provide: EventEmitter2,
                    useValue: {
                        emit: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = testingModule.get<PaymentService>(PaymentService);
        paymentStorage = testingModule.get<{ save: jest.Mock; findByTransactionId: jest.Mock }>(PaymentStorage);
        eventEmitter = testingModule.get<{ emit: jest.Mock }>(EventEmitter2);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should create payment as pending and emit start workflow event", async () => {
        const request: PaymentRequest = {
            cardNumber: "4111111111111111",
            cardHolder: "John Doe",
            expirationDate: "12/30",
            cvv: "123",
            amount: 100,
        };
        const response = await service.executePayment(request);

        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(PaymentResponse);
        expect(response.status).toBe(PaymentStatus.Pending);
        expect(response.transactionId).toBeDefined();
        expect(response.totalTimeMs).toBe(0);
        expect(response.steps.length).toBe(0);
        expect(paymentStorage.save).toHaveBeenCalledWith(response);
        expect(eventEmitter.emit).toHaveBeenCalledWith(PaymentWorkflowEvent.PaymentUpdated, {
            transactionId: response.transactionId,
            payment: response,
        });
        expect(eventEmitter.emit).toHaveBeenCalledWith(PaymentWorkflowEvent.PaymentStarted, {
            transactionId: response.transactionId,
        });
    });

    it("should return payment when found by transactionId", async () => {
        const payment = PaymentResponse.create();
        payment.approve();
        paymentStorage.findByTransactionId.mockResolvedValue(payment);

        const response = await service.getByTransactionId(payment.transactionId);

        expect(response).toBe(payment);
        expect(paymentStorage.findByTransactionId).toHaveBeenCalledWith(payment.transactionId);
    });

    it("should throw not found when payment does not exist", async () => {
        const transactionId = "tx-not-found";
        paymentStorage.findByTransactionId.mockResolvedValue(null);

        await expect(service.getByTransactionId(transactionId)).rejects.toBeInstanceOf(NotFoundException);
        expect(paymentStorage.findByTransactionId).toHaveBeenCalledWith(transactionId);
    });
});
