import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ApplicationError } from "../../application/application-error";
import {
    type AccountValidator,
    AccountValidator as AccountValidatorToken,
} from "../../infrastructure/backend/account-validator/account-validator.interface";
import {
    type AcquirerProcessor,
    AcquirerProcessor as AcquirerProcessorToken,
} from "../../infrastructure/backend/acquirer-processor/acquirer-processor.interface";
import {
    type AntiFraudValidator,
    AntiFraudValidator as AntiFraudValidatorToken,
} from "../../infrastructure/backend/anti-fraud-validator/anti-fraud-validator.interface";
import {
    type CardValidator,
    CardValidator as CardValidatorToken,
} from "../../infrastructure/backend/card-validator/card-validator.interface";
import {
    type NotificationSender,
    NotificationSender as NotificationSenderToken,
} from "../../infrastructure/backend/notification-sender/notification-sender.interface";
import {
    type PaymentProcessor,
    PaymentProcessor as PaymentProcessorToken,
} from "../../infrastructure/backend/payment-processor/payment-processor.interface";
import {
    type MetricRecorder,
    MetricRecorder as MetricRecorderToken,
} from "../../infrastructure/observability/metric-recorder/metric-recorder.interface";
import {
    type TraceInstrumenter,
    TraceInstrumenter as TraceInstrumenterToken,
} from "../../infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import {
    type PaymentStorage,
    PaymentStorage as PaymentStorageToken,
} from "../../infrastructure/persistence/payment-storage/payment-storage.interface";
import { PaymentStatus, type StepResponse } from "./payment-response.entity";
import { PaymentWorkflowEvent, type PaymentWorkflowEventPayload } from "./payment-workflow.events";

@Injectable()
export class PaymentWorkflowService {
    constructor(
        @Inject(AccountValidatorToken) private readonly accountValidator: AccountValidator,
        @Inject(CardValidatorToken) private readonly cardValidator: CardValidator,
        @Inject(AntiFraudValidatorToken) private readonly antiFraudValidator: AntiFraudValidator,
        @Inject(AcquirerProcessorToken) private readonly acquirerProcessor: AcquirerProcessor,
        @Inject(PaymentProcessorToken) private readonly paymentProcessor: PaymentProcessor,
        @Inject(NotificationSenderToken) private readonly notificationSender: NotificationSender,
        @Inject(PaymentStorageToken) private readonly paymentStorage: PaymentStorage,
        @Inject(TraceInstrumenterToken) private readonly traceInstrumenter: TraceInstrumenter,
        @Inject(MetricRecorderToken) private readonly metricRecorder: MetricRecorder,
        private readonly eventEmitter: EventEmitter2
    ) {}

    @OnEvent(PaymentWorkflowEvent.PaymentStarted, { async: true })
    async handlePaymentStarted(event: PaymentWorkflowEventPayload): Promise<void> {
        this.eventEmitter.emit(PaymentWorkflowEvent.AccountValidationRequested, {
            transactionId: event.transactionId,
        } satisfies PaymentWorkflowEventPayload);
    }

    @OnEvent(PaymentWorkflowEvent.AccountValidationRequested, { async: true })
    async handleAccountValidationRequested(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.runStepAndEmitNext(
            event,
            "account_validation",
            PaymentStatus.ValidatingAccount,
            () => this.accountValidator.validate(),
            {
                nextEvent: PaymentWorkflowEvent.CardValidationRequested,
            }
        );
    }

    @OnEvent(PaymentWorkflowEvent.CardValidationRequested, { async: true })
    async handleCardValidationRequested(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.runStepAndEmitNext(
            event,
            "card_validation",
            PaymentStatus.ValidatingCard,
            () => this.cardValidator.validate(),
            {
                nextEvent: PaymentWorkflowEvent.AntifraudValidationRequested,
            }
        );
    }

    @OnEvent(PaymentWorkflowEvent.AntifraudValidationRequested, { async: true })
    async handleAntifraudValidationRequested(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.runStepAndEmitNext(
            event,
            "antifraud_validation",
            PaymentStatus.ValidatingAntifraud,
            () => this.antiFraudValidator.validate(),
            {
                nextEvent: PaymentWorkflowEvent.AcquirerProcessingRequested,
            }
        );
    }

    @OnEvent(PaymentWorkflowEvent.AcquirerProcessingRequested, { async: true })
    async handleAcquirerProcessingRequested(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.runStepAndEmitNext(
            event,
            "acquirer_processing",
            PaymentStatus.ProcessingAcquirer,
            () => this.acquirerProcessor.process(),
            {
                nextEvent: PaymentWorkflowEvent.PaymentProcessingRequested,
            }
        );
    }

    @OnEvent(PaymentWorkflowEvent.PaymentProcessingRequested, { async: true })
    async handlePaymentProcessingRequested(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.runStepAndEmitNext(
            event,
            "payment",
            PaymentStatus.ProcessingPayment,
            () => this.paymentProcessor.process(),
            {
                nextEvent: PaymentWorkflowEvent.NotificationRequested,
            }
        );
    }

    @OnEvent(PaymentWorkflowEvent.NotificationRequested, { async: true })
    async handleNotificationRequested(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.runStepAndEmitNext(
            event,
            "notification",
            PaymentStatus.SendingNotification,
            () => this.notificationSender.send(),
            {
                shouldFinalize: true,
            }
        );
    }

    private async runStepAndEmitNext(
        event: PaymentWorkflowEventPayload,
        step: string,
        statusInProgress: PaymentStatus,
        action: () => Promise<unknown>,
        options: { nextEvent?: PaymentWorkflowEvent; shouldFinalize?: boolean }
    ): Promise<void> {
        await this.traceInstrumenter.usingSpan(
            `payment_workflow_${step}`,
            {
                transactionId: event.transactionId,
                step,
            },
            async () => {
                const payment = await this.paymentStorage.findByTransactionId(event.transactionId);
                if (!payment) return;

                try {
                    payment.updateStatus(statusInProgress);
                    await this.paymentStorage.save(payment);

                    const stepResponse = await this.runStep(step, action);
                    payment.addStep(stepResponse);

                    if (options.shouldFinalize) {
                        payment.approve();
                    }

                    await this.paymentStorage.save(payment);

                    if (options.shouldFinalize) {
                        this.metricRecorder.recordHistogram("payment_execution_duration_ms", payment.totalTimeMs, {
                            action: "payment_execution",
                            outcome: "success",
                        });
                        this.metricRecorder.incrementCounter("payment_total", 1, {
                            outcome: "success",
                        });
                        return;
                    }

                    if (options.nextEvent) {
                        this.eventEmitter.emit(options.nextEvent, {
                            transactionId: payment.transactionId,
                        } satisfies PaymentWorkflowEventPayload);
                    }
                } catch (error) {
                    payment.status = error instanceof ApplicationError ? PaymentStatus.Declined : PaymentStatus.Error;
                    await this.paymentStorage.save(payment);

                    const outcome = payment.status === PaymentStatus.Declined ? "declined" : "error";

                    this.metricRecorder.recordHistogram("payment_execution_duration_ms", payment.totalTimeMs, {
                        action: "payment_execution",
                        outcome,
                    });
                    this.metricRecorder.incrementCounter("payment_total", 1, {
                        outcome,
                    });
                }
            }
        );
    }

    private async runStep(step: string, action: () => Promise<unknown>): Promise<StepResponse> {
        const startedAt = Date.now();
        let outcome: "success" | "error" = "success";
        try {
            await action();
            return { step, timeMs: Date.now() - startedAt };
        } catch (error) {
            outcome = "error";
            throw error;
        } finally {
            const durationMs = Date.now() - startedAt;
            this.metricRecorder.recordHistogram("payment_step_duration_ms", durationMs, {
                step,
                outcome,
            });
            this.metricRecorder.incrementCounter("payment_step_total", 1, {
                step,
                outcome,
            });
        }
    }
}
