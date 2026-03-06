import { Test, TestingModule } from "@nestjs/testing";
import { AccountValidationFailedError } from "../../../application/application-errors/account-validation-error";
import { PaymentProcessingFailedError } from "../../../application/application-errors/payment-processing-error";
import { Payment, PaymentStatus } from "../../../features/payment/payment.entity";
import { PaymentWorkflowEvent } from "../../../features/payment/payment-workflow.events";
import { MetricRecorder } from "../../observability/metric-recorder/metric-recorder.interface";
import { TraceInstrumenter } from "../../observability/trace-instrumenter/trace-instrumenter.interface";
import { PaymentStorage } from "../../persistence/payment-storage/payment-storage.interface";
import { PaymentStepExecutor } from "./payment-step-executor";
import { PaymentUpdatesBroadcaster } from "./payment-updates-broadcaster.service";
import { PaymentWorkflowCoordinator } from "./payment-workflow-coordinator.service";
import { PaymentWorkflowQueueService } from "./payment-workflow-queue.service";

describe("PaymentWorkflowCoordinator", () => {
    let coordinator: PaymentWorkflowCoordinator;
    let paymentStorage: { save: jest.Mock; findByTransactionId: jest.Mock };
    let paymentWorkflowQueueService: { enqueue: jest.Mock };

    beforeEach(async () => {
        const testingModule: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentWorkflowCoordinator,
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
                PaymentStepExecutor,
            ],
        }).compile();

        coordinator = testingModule.get(PaymentWorkflowCoordinator);
        paymentStorage = testingModule.get(PaymentStorage);
        paymentWorkflowQueueService = testingModule.get(PaymentWorkflowQueueService);
    });

    it("should retry step when failure is retryable and then succeed", async () => {
        const payment = Payment.create();
        paymentStorage.findByTransactionId.mockResolvedValue(payment);

        const action = jest
            .fn()
            .mockRejectedValueOnce(new PaymentProcessingFailedError({ reason: "transient" }))
            .mockResolvedValueOnce(undefined);

        await coordinator.execute({
            event: { transactionId: payment.transactionId },
            step: "payment",
            statusInProgress: PaymentStatus.ProcessingPayment,
            action,
            retryPolicy: {
                maxAttempts: 2,
                initialDelayMs: 0,
                jitterMs: 0,
            },
        });

        expect(action).toHaveBeenCalledTimes(2);
        expect(payment.steps).toHaveLength(1);
        expect(payment.steps[0]?.step).toBe("payment");
    });

    it("should fail payment without retry for non-retryable errors", async () => {
        const payment = Payment.create();
        paymentStorage.findByTransactionId.mockResolvedValue(payment);

        const action = jest.fn().mockRejectedValue(new AccountValidationFailedError({ reason: "business" }));

        await coordinator.execute({
            event: { transactionId: payment.transactionId },
            step: "account_validation",
            statusInProgress: PaymentStatus.ValidatingAccount,
            action,
            retryPolicy: {
                maxAttempts: 3,
                initialDelayMs: 0,
                jitterMs: 0,
            },
        });

        expect(action).toHaveBeenCalledTimes(1);
        expect(payment.status).toBe(PaymentStatus.Declined);
        expect(payment.failure?.code).toBe("ACCOUNT_VALIDATION_FAILED");
    });

    it("should skip duplicated step execution and emit next event", async () => {
        const payment = Payment.create();
        payment.addStep({ step: "card_validation", timeMs: 10 });
        paymentStorage.findByTransactionId.mockResolvedValue(payment);

        const action = jest.fn().mockResolvedValue(undefined);

        await coordinator.execute({
            event: { transactionId: payment.transactionId },
            step: "card_validation",
            statusInProgress: PaymentStatus.ValidatingCard,
            action,
            nextEvent: PaymentWorkflowEvent.AntifraudValidationRequested,
        });

        expect(action).not.toHaveBeenCalled();
        expect(paymentWorkflowQueueService.enqueue).toHaveBeenCalledWith(
            PaymentWorkflowEvent.AntifraudValidationRequested,
            {
                transactionId: payment.transactionId,
            }
        );
    });

    it("should continue flow on non-blocking failure", async () => {
        const payment = Payment.create();
        paymentStorage.findByTransactionId.mockResolvedValue(payment);

        const action = jest.fn().mockRejectedValue(new PaymentProcessingFailedError({ reason: "transient" }));

        await coordinator.execute({
            event: { transactionId: payment.transactionId },
            step: "notification",
            statusInProgress: PaymentStatus.SendingNotification,
            action,
            failureBehavior: "continue",
            retryPolicy: {
                maxAttempts: 1,
                initialDelayMs: 0,
                jitterMs: 0,
            },
        });

        expect(payment.status).toBe(PaymentStatus.SendingNotification);
        expect(payment.failure).toBeUndefined();
    });

    it("should rethrow non-domain errors without finalizing payment", async () => {
        const payment = Payment.create();
        paymentStorage.findByTransactionId.mockResolvedValue(payment);

        const action = jest.fn().mockRejectedValue(new Error("Connection is closed"));

        await expect(
            coordinator.execute({
                event: { transactionId: payment.transactionId },
                step: "payment",
                statusInProgress: PaymentStatus.ProcessingPayment,
                action,
            })
        ).rejects.toThrow("Connection is closed");

        expect(payment.status).toBe(PaymentStatus.ProcessingPayment);
        expect(payment.failure).toBeUndefined();
    });
});
