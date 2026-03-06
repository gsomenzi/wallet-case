import { Inject, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ApplicationError } from "../../application/application-error";
import { type PaymentResponse, PaymentStatus, type StepResponse } from "../../features/payment/payment-response.entity";
import {
    type PaymentUpdatedEventPayload,
    PaymentWorkflowEvent,
    type PaymentWorkflowEventPayload,
} from "../../features/payment/payment-workflow.events";
import { MetricRecorder } from "../observability/metric-recorder/metric-recorder.interface";
import { TraceInstrumenter } from "../observability/trace-instrumenter/trace-instrumenter.interface";
import { PaymentStorage } from "../persistence/payment-storage/payment-storage.interface";

type ExecuteStepInput = {
    event: PaymentWorkflowEventPayload;
    step: string;
    statusInProgress: PaymentStatus;
    action: () => Promise<unknown>;
    nextEvent?: PaymentWorkflowEvent;
};

@Injectable()
export class PaymentWorkflowCoordinator {
    constructor(
        @Inject(PaymentStorage) private readonly paymentStorage: PaymentStorage,
        @Inject(TraceInstrumenter) private readonly traceInstrumenter: TraceInstrumenter,
        @Inject(MetricRecorder) private readonly metricRecorder: MetricRecorder,
        private readonly eventEmitter: EventEmitter2
    ) {}

    async execute(input: ExecuteStepInput): Promise<void> {
        const { action, event, statusInProgress, step } = input;
        await this.traceInstrumenter.usingSpan(
            `payment_workflow_${step}`,
            {
                transactionId: event.transactionId,
                step,
            },
            async () => {
                const payment = await this.paymentStorage.findByTransactionId(input.event.transactionId);
                if (!payment) return;
                const { transactionId, totalTimeMs } = payment;

                try {
                    payment.updateStatus(statusInProgress);
                    await this.paymentStorage.save(payment);
                    this.publishPaymentUpdated(transactionId, payment);

                    const stepResponse = await this.runStep(step, action);
                    payment.addStep(stepResponse);

                    await this.paymentStorage.save(payment);
                    this.publishPaymentUpdated(transactionId, payment);

                    if (input.nextEvent) {
                        this.eventEmitter.emit(input.nextEvent, {
                            transactionId,
                        } satisfies PaymentWorkflowEventPayload);
                    }
                } catch (error) {
                    if (error instanceof ApplicationError) {
                        payment.decline({
                            code: error.code,
                            message: error.message,
                            details: error.details,
                        });
                    } else {
                        payment.error({
                            code: "UNKNOWN_APPLICATION_ERROR",
                            message: error instanceof Error ? error.message : "Erro inesperado ao processar pagamento",
                        });
                    }
                    await this.paymentStorage.save(payment);
                    this.publishPaymentUpdated(transactionId, payment);

                    const outcome = payment.status === PaymentStatus.Declined ? "declined" : "error";

                    this.metricRecorder.recordHistogram("payment_execution_duration_ms", totalTimeMs, {
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

    async completeAsApproved(event: PaymentWorkflowEventPayload): Promise<void> {
        const payment = await this.paymentStorage.findByTransactionId(event.transactionId);
        if (!payment) return;

        payment.approve();
        await this.paymentStorage.save(payment);
        this.publishPaymentUpdated(payment.transactionId, payment);

        this.metricRecorder.recordHistogram("payment_execution_duration_ms", payment.totalTimeMs, {
            action: "payment_execution",
            outcome: "success",
        });
        this.metricRecorder.incrementCounter("payment_total", 1, {
            outcome: "success",
        });
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

    private publishPaymentUpdated(transactionId: string, payment: PaymentResponse): void {
        this.eventEmitter.emit(PaymentWorkflowEvent.PaymentUpdated, {
            transactionId,
            payment,
        } satisfies PaymentUpdatedEventPayload);
    }
}
