import { randomUUID } from "node:crypto";

export type StepResponse = {
    step: string;
    timeMs: number;
};

export enum PaymentStatus {
    Pending = "pending",
    ValidatingAccount = "validating_account",
    ValidatingCard = "validating_card",
    ValidatingAntifraud = "validating_antifraud",
    ProcessingAcquirer = "processing_acquirer",
    ProcessingPayment = "processing_payment",
    SendingNotification = "sending_notification",
    Approved = "approved",
    Declined = "declined",
    Error = "error",
}

export class PaymentResponse {
    status: PaymentStatus;
    transactionId: string;
    totalTimeMs: number;
    steps: StepResponse[];

    constructor(status: PaymentStatus, transactionId: string, totalTimeMs: number, steps: StepResponse[]) {
        this.status = status;
        this.transactionId = transactionId;
        this.totalTimeMs = totalTimeMs;
        this.steps = steps;
    }

    static create(): PaymentResponse {
        return new PaymentResponse(PaymentStatus.Pending, randomUUID(), 0, []);
    }

    addStep(step: StepResponse) {
        this.steps.push(step);
        this.totalTimeMs += step.timeMs;
    }

    updateStatus(status: PaymentStatus) {
        this.status = status;
    }

    approve() {
        this.status = PaymentStatus.Approved;
    }

    decline() {
        this.status = PaymentStatus.Declined;
    }

    error() {
        this.status = PaymentStatus.Error;
    }
}
