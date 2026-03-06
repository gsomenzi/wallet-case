import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AccountValidator } from "../../infrastructure/backend/account-validator/account-validator.interface";
import { AcquirerProcessor } from "../../infrastructure/backend/acquirer-processor/acquirer-processor.interface";
import { AntiFraudValidator } from "../../infrastructure/backend/anti-fraud-validator/anti-fraud-validator.interface";
import { CardValidator } from "../../infrastructure/backend/card-validator/card-validator.interface";
import { NotificationSender } from "../../infrastructure/backend/notification-sender/notification-sender.interface";
import { PaymentProcessor } from "../../infrastructure/backend/payment-processor/payment-processor.interface";
import { MetricRecorder } from "../../infrastructure/observability/metric-recorder/metric-recorder.interface";
import { TraceInstrumenter } from "../../infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import { PaymentStorage } from "../../infrastructure/persistence/payment-storage/payment-storage.interface";
import { PaymentService } from "./payment.service";
import { PaymentRequest } from "./payment-request.dto";
import { PaymentResponse, PaymentStatus } from "./payment-response.entity";

describe("PaymentService", () => {
    let service: PaymentService;
    let testingModule: TestingModule;
    let paymentStorage: { save: jest.Mock; findByTransactionId: jest.Mock };

    beforeEach(async () => {
        testingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                {
                    provide: AccountValidator,
                    useValue: {
                        validate: jest.fn().mockResolvedValue(true),
                    },
                },
                {
                    provide: CardValidator,
                    useValue: {
                        validate: jest.fn().mockResolvedValue(true),
                    },
                },
                {
                    provide: AntiFraudValidator,
                    useValue: {
                        validate: jest.fn().mockResolvedValue(true),
                    },
                },
                {
                    provide: AcquirerProcessor,
                    useValue: {
                        process: jest.fn().mockResolvedValue(undefined),
                    },
                },
                {
                    provide: PaymentProcessor,
                    useValue: {
                        process: jest.fn().mockResolvedValue(undefined),
                    },
                },
                {
                    provide: NotificationSender,
                    useValue: {
                        send: jest.fn().mockResolvedValue(undefined),
                    },
                },
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
            ],
        }).compile();

        service = testingModule.get<PaymentService>(PaymentService);
        paymentStorage = testingModule.get<{ save: jest.Mock; findByTransactionId: jest.Mock }>(PaymentStorage);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should process payment and return a valid response", async () => {
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
        expect(response.status).toBe(PaymentStatus.Approved);
        expect(response.transactionId).toBeDefined();
        expect(response.totalTimeMs).toBeGreaterThanOrEqual(0);
        expect(response.steps.length).toBe(6);
        expect(paymentStorage.save).toHaveBeenCalledWith(response);
        response.steps.forEach((step) => {
            expect(step.timeMs).toBeGreaterThanOrEqual(0);
            expect(step.step).toBeDefined();
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
