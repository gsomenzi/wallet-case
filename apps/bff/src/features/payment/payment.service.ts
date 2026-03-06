import { Inject, Injectable } from "@nestjs/common";
import { TraceInstrumenter } from "src/infrastructure/observability/trace-instrumenter/trace-instrumenter.interface";
import { AccountValidator } from "../../infrastructure/backend/account-validator/account-validator.interface";
import { AcquirerProcessor } from "../../infrastructure/backend/acquirer-processor/acquirer-processor.interface";
import { AntiFraudValidator } from "../../infrastructure/backend/anti-fraud-validator/anti-fraud-validator.interface";
import { CardValidator } from "../../infrastructure/backend/card-validator/card-validator.interface";
import { NotificationSender } from "../../infrastructure/backend/notification-sender/notification-sender.interface";
import { PaymentProcessor } from "../../infrastructure/backend/payment-processor/payment-processor.interface";
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
        @Inject(TraceInstrumenter) private readonly traceInstrumenter: TraceInstrumenter
    ) {}

    async executePayment(_paymentRequest: PaymentRequest): Promise<PaymentResponse> {
        return await this.traceInstrumenter.usingSpan("payment_execution", {}, async () => {
            const paymentResponse: PaymentResponse = PaymentResponse.create();
            paymentResponse.addStep(await this.validateAccount());
            paymentResponse.addStep(await this.validateCard());
            paymentResponse.addStep(await this.validateAntifraud());
            paymentResponse.addStep(await this.processAcquirer());
            paymentResponse.addStep(await this.processPayment());
            paymentResponse.addStep(await this.sendNotification());
            paymentResponse.approve();
            return paymentResponse;
        });
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
        await action();
        return { step, timeMs: Date.now() - startedAt };
    }
}
