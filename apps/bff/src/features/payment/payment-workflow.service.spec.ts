import { EventEmitter2 } from "@nestjs/event-emitter";
import { Test, TestingModule } from "@nestjs/testing";
import { AccountValidationFailedError } from "../../application/application-errors/account-validation-error";
import { AccountValidator } from "../../infrastructure/backend/account-validator/account-validator.interface";
import { AcquirerProcessor } from "../../infrastructure/backend/acquirer-processor/acquirer-processor.interface";
import { AntiFraudValidator } from "../../infrastructure/backend/anti-fraud-validator/anti-fraud-validator.interface";
import { CardValidator } from "../../infrastructure/backend/card-validator/card-validator.interface";
import { NotificationSender } from "../../infrastructure/backend/notification-sender/notification-sender.interface";
import { PaymentProcessor } from "../../infrastructure/backend/payment-processor/payment-processor.interface";
import { MetricRecorder } from "../../infrastructure/observability/metric-recorder/metric-recorder.interface";
import { TraceInstrumenter } from "../../infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import { PaymentStorage } from "../../infrastructure/persistence/payment-storage/payment-storage.interface";
import { PaymentResponse, PaymentStatus } from "./payment-response.entity";
import { PaymentWorkflowEvent } from "./payment-workflow.events";
import { PaymentWorkflowService } from "./payment-workflow.service";

describe("PaymentWorkflowService", () => {
    let service: PaymentWorkflowService;
    let paymentStorage: { save: jest.Mock; findByTransactionId: jest.Mock };
    let eventEmitter: { emit: jest.Mock };
    let accountValidator: { validate: jest.Mock };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentWorkflowService,
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
                        process: jest.fn().mockResolvedValue(true),
                    },
                },
                {
                    provide: PaymentProcessor,
                    useValue: {
                        process: jest.fn().mockResolvedValue(true),
                    },
                },
                {
                    provide: NotificationSender,
                    useValue: {
                        send: jest.fn().mockResolvedValue(true),
                    },
                },
                {
                    provide: PaymentStorage,
                    useValue: {
                        save: jest.fn().mockResolvedValue(undefined),
                        findByTransactionId: jest.fn(),
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

        service = module.get<PaymentWorkflowService>(PaymentWorkflowService);
        paymentStorage = module.get<{ save: jest.Mock; findByTransactionId: jest.Mock }>(PaymentStorage);
        eventEmitter = module.get<{ emit: jest.Mock }>(EventEmitter2);
        accountValidator = module.get<{ validate: jest.Mock }>(AccountValidator);
    });

    it("should fan out workflow start to first business event", async () => {
        const payment = PaymentResponse.create();

        await service.handlePaymentStarted({ transactionId: payment.transactionId });

        expect(accountValidator.validate).not.toHaveBeenCalled();
        expect(eventEmitter.emit).toHaveBeenCalledWith(PaymentWorkflowEvent.AccountValidationRequested, {
            transactionId: payment.transactionId,
        });
    });

    it("should execute account validation and emit next workflow event", async () => {
        const payment = PaymentResponse.create();
        paymentStorage.findByTransactionId.mockResolvedValue(payment);

        await service.handleAccountValidationRequested({ transactionId: payment.transactionId });

        expect(accountValidator.validate).toHaveBeenCalled();
        expect(payment.status).toBe(PaymentStatus.ValidatingAccount);
        expect(payment.steps).toHaveLength(1);
        expect(payment.steps[0].step).toBe("account_validation");
        expect(eventEmitter.emit).toHaveBeenCalledWith(PaymentWorkflowEvent.CardValidationRequested, {
            transactionId: payment.transactionId,
        });
    });

    it("should finalize as approved after notification step", async () => {
        const payment = PaymentResponse.create();
        paymentStorage.findByTransactionId.mockResolvedValue(payment);

        await service.handleNotificationRequested({ transactionId: payment.transactionId });

        expect(payment.status).toBe(PaymentStatus.Approved);
        expect(payment.steps).toHaveLength(1);
        expect(payment.steps[0].step).toBe("notification");
    });

    it("should set processing status for payment step", async () => {
        const payment = PaymentResponse.create();
        paymentStorage.findByTransactionId.mockResolvedValue(payment);

        await service.handlePaymentProcessingRequested({ transactionId: payment.transactionId });

        expect(payment.status).toBe(PaymentStatus.ProcessingPayment);
        expect(payment.steps).toHaveLength(1);
        expect(payment.steps[0].step).toBe("payment");
    });

    it("should mark payment as declined when application error happens", async () => {
        const payment = PaymentResponse.create();
        paymentStorage.findByTransactionId.mockResolvedValue(payment);
        accountValidator.validate.mockRejectedValue(new AccountValidationFailedError());

        await service.handleAccountValidationRequested({ transactionId: payment.transactionId });

        expect(payment.status).toBe(PaymentStatus.Declined);
        expect(eventEmitter.emit).not.toHaveBeenCalledWith(PaymentWorkflowEvent.CardValidationRequested, {
            transactionId: payment.transactionId,
        });
    });
});
