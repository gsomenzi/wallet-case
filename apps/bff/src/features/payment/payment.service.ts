import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AccountValidator } from "../../infrastructure/backend/account-validator/account-validator.interface";
import { AcquirerProcessor } from "../../infrastructure/backend/acquirer-processor/acquirer-processor.interface";
import { AntiFraudValidator } from "../../infrastructure/backend/anti-fraud-validator/anti-fraud-validator.interface";
import { CardValidator } from "../../infrastructure/backend/card-validator/card-validator.interface";
import { NotificationSender } from "../../infrastructure/backend/notification-sender/notification-sender.interface";
import { PaymentProcessor } from "../../infrastructure/backend/payment-processor/payment-processor.interface";
import { MetricRecorder } from "../../infrastructure/observability/metric-recorder/metric-recorder.interface";
import { TraceInstrumenter } from "../../infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import { PaymentStorage } from "../../infrastructure/persistence/payment-storage/payment-storage.interface";
import { PaymentRequest } from "./payment-request.dto";
import { PaymentResponse, StepResponse } from "./payment-response.entity";

@Injectable()
export class PaymentService {
    constructor(
        @Inject(AccountValidator) private readonly accountValidator: AccountValidator,
        @Inject(CardValidator) private readonly cardValidator: CardValidator,
        @Inject(AntiFraudValidator) private readonly antiFraudValidator: AntiFraudValidator,
        @Inject(AcquirerProcessor) private readonly acquirerProcessor: AcquirerProcessor,
        @Inject(PaymentProcessor) private readonly paymentProcessor: PaymentProcessor,
        @Inject(NotificationSender) private readonly notificationSender: NotificationSender,
        @Inject(PaymentStorage) private readonly paymentStorage: PaymentStorage,
        @Inject(TraceInstrumenter) private readonly traceInstrumenter: TraceInstrumenter,
        @Inject(MetricRecorder) private readonly metricRecorder: MetricRecorder
    ) {}

    async executePayment(_paymentRequest: PaymentRequest): Promise<PaymentResponse> {
        const startedAt = Date.now();
        let outcome: "success" | "error" = "success";

        try {
            return await this.traceInstrumenter.usingSpan("payment_execution", {}, async () => {
                const paymentResponse: PaymentResponse = PaymentResponse.create();
                paymentResponse.addStep(await this.validateAccount());
                paymentResponse.addStep(await this.validateCard());
                paymentResponse.addStep(await this.validateAntifraud());
                paymentResponse.addStep(await this.processAcquirer());
                paymentResponse.addStep(await this.processPayment());
                paymentResponse.addStep(await this.sendNotification());
                paymentResponse.approve();
                await this.paymentStorage.save(paymentResponse);
                return paymentResponse;
            });
        } catch (error) {
            outcome = "error";
            throw error;
        } finally {
            this.metricRecorder.recordHistogram("payment_execution_duration_ms", Date.now() - startedAt, {
                action: "payment_execution",
                outcome,
            });
            this.metricRecorder.incrementCounter("payment_total", 1, {
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

    private async validateAccount(): Promise<StepResponse> {
        return this.runStep("account_validation", () => this.accountValidator.validate());
    }

    private async validateCard(): Promise<StepResponse> {
        return this.runStep("card_validation", () => this.cardValidator.validate());
    }

    private async validateAntifraud(): Promise<StepResponse> {
        return this.runStep("antifraud_validation", () => this.antiFraudValidator.validate());
    }

    private async processAcquirer(): Promise<StepResponse> {
        return this.runStep("acquirer_processing", () => this.acquirerProcessor.process());
    }

    private async processPayment(): Promise<StepResponse> {
        return this.runStep("payment", () => this.paymentProcessor.process());
    }

    private async sendNotification(): Promise<StepResponse> {
        return this.runStep("notification", () => this.notificationSender.send());
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
