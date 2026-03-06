import { randomUUID } from "node:crypto";

export type StepResponse = {
    step: string;
    timeMs: number;
};

export type PaymentFailure = {
    code: string;
    message: string;
    details?: Record<string, unknown>;
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
    failure?: PaymentFailure;

    constructor(
        status: PaymentStatus,
        transactionId: string,
        totalTimeMs: number,
        steps: StepResponse[],
        failure?: PaymentFailure
    ) {
        this.status = status;
        this.transactionId = transactionId;
        this.totalTimeMs = totalTimeMs;
        this.steps = steps;
        this.failure = failure;
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
        if (status !== PaymentStatus.Declined && status !== PaymentStatus.Error) {
            this.failure = undefined;
        }
    }

    approve() {
        this.status = PaymentStatus.Approved;
        this.failure = undefined;
    }

    decline(failure?: PaymentFailure) {
        this.status = PaymentStatus.Declined;
        this.failure = failure;
    }

    error(failure?: PaymentFailure) {
        this.status = PaymentStatus.Error;
        this.failure = failure;
    }
}
