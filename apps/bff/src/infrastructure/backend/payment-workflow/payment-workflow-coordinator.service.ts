import { Inject, Injectable } from "@nestjs/common";
import { ApplicationError } from "../../../application/application-error";
import { type Payment, PaymentStatus } from "../../../features/payment/payment.entity";
import {
    PaymentWorkflowEvent,
    type PaymentWorkflowEventPayload,
} from "../../../features/payment/payment-workflow.events";
import { MetricRecorder } from "../../observability/metric-recorder/metric-recorder.interface";
import { TraceInstrumenter } from "../../observability/trace-instrumenter/trace-instrumenter.interface";
import { PaymentStorage } from "../../persistence/payment-storage/payment-storage.interface";
import { PaymentStepExecutor, type RetryPolicy } from "./payment-step-executor";
import { PaymentUpdatesBroadcaster } from "./payment-updates-broadcaster.service";
import { applyWorkflowFailure } from "./payment-workflow-failure";
import { hasStepAlreadyExecuted, isTerminalStatus } from "./payment-workflow-guards";
import { PaymentWorkflowQueueService } from "./payment-workflow-queue.service";

type ExecuteStepFailureBehavior = "fail-payment" | "continue";

type ExecuteStepInput = {
    event: PaymentWorkflowEventPayload;
    step: string;
    statusInProgress: PaymentStatus;
    action: () => Promise<unknown>;
    nextEvent?: PaymentWorkflowEvent;
    retryPolicy?: Partial<RetryPolicy>;
    failureBehavior?: ExecuteStepFailureBehavior;
};

@Injectable()
export class PaymentWorkflowCoordinator {
    constructor(
        @Inject(PaymentStorage) private readonly paymentStorage: PaymentStorage,
        @Inject(TraceInstrumenter)
        private readonly traceInstrumenter: TraceInstrumenter,
        @Inject(MetricRecorder) private readonly metricRecorder: MetricRecorder,
        private readonly paymentStepExecutor: PaymentStepExecutor,
        private readonly paymentUpdatesBroadcaster: PaymentUpdatesBroadcaster,
        private readonly paymentWorkflowQueueService: PaymentWorkflowQueueService
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
                const { transactionId } = payment;

                if (isTerminalStatus(payment.status)) {
                    return;
                }

                if (hasStepAlreadyExecuted(payment, step)) {
                    if (input.nextEvent) {
                        await this.paymentWorkflowQueueService.enqueue(input.nextEvent, {
                            transactionId,
                        } satisfies PaymentWorkflowEventPayload);
                    }
                    this.metricRecorder.incrementCounter("payment_step_skipped_total", 1, {
                        step,
                        reason: "already_completed",
                    });
                    return;
                }

                try {
                    payment.updateStatus(statusInProgress);
                    await this.paymentStorage.save(payment);
                    this.publishPaymentUpdated(transactionId, payment);

                    const stepResponse = await this.paymentStepExecutor.executeWithResilience({
                        step,
                        action,
                        retryPolicy: input.retryPolicy,
                    });
                    payment.addStep(stepResponse);

                    await this.paymentStorage.save(payment);
                    this.publishPaymentUpdated(transactionId, payment);

                    if (input.nextEvent) {
                        await this.paymentWorkflowQueueService.enqueue(input.nextEvent, {
                            transactionId,
                        } satisfies PaymentWorkflowEventPayload);
                    }
                } catch (error) {
                    if (error instanceof ApplicationError && input.failureBehavior === "continue") {
                        this.metricRecorder.incrementCounter("payment_step_non_blocking_failure_total", 1, {
                            step,
                        });
                        return;
                    }

                    if (error instanceof ApplicationError) {
                        const outcome = applyWorkflowFailure(payment, error);
                        await this.paymentStorage.save(payment);
                        this.publishPaymentUpdated(transactionId, payment);

                        this.metricRecorder.recordHistogram("payment_execution_duration_ms", payment.totalTimeMs, {
                            action: "payment_execution",
                            outcome,
                        });
                        this.metricRecorder.incrementCounter("payment_total", 1, {
                            outcome,
                        });
                        return;
                    }

                    throw error;
                }
            }
        );
    }

    async completeAsApproved(event: PaymentWorkflowEventPayload): Promise<void> {
        const payment = await this.paymentStorage.findByTransactionId(event.transactionId);
        if (!payment) return;
        if (isTerminalStatus(payment.status)) return;

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

    private publishPaymentUpdated(transactionId: string, payment: Payment): void {
        this.paymentUpdatesBroadcaster.publish({
            transactionId,
            payment,
        });
    }
}
