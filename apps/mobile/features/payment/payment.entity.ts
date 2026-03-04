export type StepResponse = {
    step: string;
    timeMs: number;
};

export enum PaymentStatus {
    Pending = "pending",
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
}
