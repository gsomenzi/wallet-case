import { Injectable } from "@nestjs/common";
import { PaymentRequest } from "./payment-request.dto";
import { PaymentResponse, StepResponse } from "./payment-response.entity";

@Injectable()
export class PaymentService {
    async processPayment(_paymentRequest: PaymentRequest): Promise<PaymentResponse> {
        const paymentResponse: PaymentResponse = PaymentResponse.create();
        paymentResponse.addStep(await this.validateAccount());
        paymentResponse.addStep(await this.validateCard());
        paymentResponse.addStep(await this.validateAntifraud());
        paymentResponse.addStep(await this.processAquirer());
        paymentResponse.addStep(await this.executePayment());
        paymentResponse.addStep(await this.sendNotification());
        paymentResponse.approve();
        return paymentResponse;
    }

    private async validateAccount(): Promise<StepResponse> {
        return this.runStep("account_validation", 450, 730);
    }
    private async validateCard(): Promise<StepResponse> {
        return this.runStep("card_validation", 300, 800);
    }
    private async validateAntifraud(): Promise<StepResponse> {
        return this.runStep("anti_fraud", 700, 1500);
    }
    private async processAquirer(): Promise<StepResponse> {
        return this.runStep("aquirer_processing", 1000, 2500);
    }
    private async executePayment(): Promise<StepResponse> {
        return this.runStep("payment", 800, 1250);
    }
    private async sendNotification(): Promise<StepResponse> {
        return this.runStep("notification", 200, 300);
    }

    private async runStep(step: string, minTimeInMs: number, maxTimeInMs: number): Promise<StepResponse> {
        const startedAt = Date.now();
        await this.simulateDelay(minTimeInMs, maxTimeInMs);
        return { step, timeMs: Date.now() - startedAt };
    }

    private simulateDelay(minTimeInMs: number, maxTimeInMs: number): Promise<void> {
        const delay = Math.floor(Math.random() * (maxTimeInMs - minTimeInMs + 1)) + minTimeInMs;
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
}
