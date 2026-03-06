import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PaymentUpdatesBroadcaster } from "../../infrastructure/backend/payment-workflow/payment-updates-broadcaster.service";
import { PaymentWorkflowQueueService } from "../../infrastructure/backend/payment-workflow/payment-workflow-queue.service";
import { MetricRecorder } from "../../infrastructure/observability/metric-recorder/metric-recorder.interface";
import { TraceInstrumenter } from "../../infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import { PaymentStorage } from "../../infrastructure/persistence/payment-storage/payment-storage.interface";
import { Payment, PaymentStatus } from "./payment.entity";
import { PaymentService } from "./payment.service";
import { PaymentRequest } from "./payment-request.dto";
import { PaymentWorkflowEvent } from "./payment-workflow.events";

describe("PaymentService", () => {
    let service: PaymentService;
    let testingModule: TestingModule;
    let paymentStorage: { save: jest.Mock; findByTransactionId: jest.Mock };
    let paymentUpdatesBroadcaster: { publish: jest.Mock };
    let paymentWorkflowQueueService: { enqueue: jest.Mock };

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
                    provide: PaymentUpdatesBroadcaster,
                    useValue: {
                        publish: jest.fn(),
                    },
                },
                {
                    provide: PaymentWorkflowQueueService,
                    useValue: {
                        enqueue: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        }).compile();

        service = testingModule.get<PaymentService>(PaymentService);
        paymentStorage = testingModule.get<{
            save: jest.Mock;
            findByTransactionId: jest.Mock;
        }>(PaymentStorage);
        paymentUpdatesBroadcaster = testingModule.get<{ publish: jest.Mock }>(PaymentUpdatesBroadcaster);
        paymentWorkflowQueueService = testingModule.get<{ enqueue: jest.Mock }>(PaymentWorkflowQueueService);
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
        expect(response).toBeInstanceOf(Payment);
        expect(response.status).toBe(PaymentStatus.Pending);
        expect(response.transactionId).toBeDefined();
        expect(response.totalTimeMs).toBe(0);
        expect(response.steps.length).toBe(0);
        expect(paymentStorage.save).toHaveBeenCalledWith(response);
        expect(paymentUpdatesBroadcaster.publish).toHaveBeenCalledWith({
            transactionId: response.transactionId,
            payment: response,
        });
        expect(paymentWorkflowQueueService.enqueue).toHaveBeenCalledWith(PaymentWorkflowEvent.PaymentStarted, {
            transactionId: response.transactionId,
        });
    });

    it("should return payment when found by transactionId", async () => {
        const payment = Payment.create();
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
