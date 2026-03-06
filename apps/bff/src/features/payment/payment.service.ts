import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { MetricRecorder } from "../../infrastructure/observability/metric-recorder/metric-recorder.interface";
import { TraceInstrumenter } from "../../infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import { PaymentStorage } from "../../infrastructure/persistence/payment-storage/payment-storage.interface";
import { PaymentRequest } from "./payment-request.dto";
import { PaymentResponse } from "./payment-response.entity";
import {
    type PaymentUpdatedEventPayload,
    PaymentWorkflowEvent,
    type PaymentWorkflowEventPayload,
} from "./payment-workflow.events";

@Injectable()
export class PaymentService {
    constructor(
        @Inject(PaymentStorage) private readonly paymentStorage: PaymentStorage,
        @Inject(TraceInstrumenter) private readonly traceInstrumenter: TraceInstrumenter,
        @Inject(MetricRecorder) private readonly metricRecorder: MetricRecorder,
        private readonly eventEmitter: EventEmitter2
    ) {}

    async executePayment(_paymentRequest: PaymentRequest): Promise<PaymentResponse> {
        const startedAt = Date.now();
        let outcome: "success" | "error" = "success";

        try {
            return await this.traceInstrumenter.usingSpan("payment_execution", {}, async () => {
                const paymentResponse: PaymentResponse = PaymentResponse.create();
                await this.paymentStorage.save(paymentResponse);
                this.eventEmitter.emit(PaymentWorkflowEvent.PaymentUpdated, {
                    transactionId: paymentResponse.transactionId,
                    payment: paymentResponse,
                } satisfies PaymentUpdatedEventPayload);
                this.eventEmitter.emit(PaymentWorkflowEvent.PaymentStarted, {
                    transactionId: paymentResponse.transactionId,
                } satisfies PaymentWorkflowEventPayload);
                return paymentResponse;
            });
        } catch (error) {
            outcome = "error";
            throw error;
        } finally {
            this.metricRecorder.recordHistogram("payment_execution_duration_ms", Date.now() - startedAt, {
                action: "payment_creation",
                outcome,
            });
            this.metricRecorder.incrementCounter("payment_creation_total", 1, {
                outcome,
            });
        }
    }

    async getByTransactionId(transactionId: string): Promise<PaymentResponse> {
        const payment = await this.paymentStorage.findByTransactionId(transactionId);

        if (!payment) {
            throw new NotFoundException({
                code: "PAYMENT_NOT_FOUND",
                message: "Payment não encontrado",
            });
        }

        return payment;
    }
}
