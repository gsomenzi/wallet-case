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

export class Payment {
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

    static deserialize(data: unknown): Payment | null {
        const normalizedData = (() => {
            if (typeof data === "string") {
                try {
                    return JSON.parse(data);
                } catch {
                    return null;
                }
            }

            return data;
        })();

        if (!normalizedData || typeof normalizedData !== "object") {
            return null;
        }

        const parsedData = normalizedData as Partial<Payment>;

        if (!parsedData.status || !Object.values(PaymentStatus).includes(parsedData.status)) {
            return null;
        }

        if (typeof parsedData.transactionId !== "string") {
            return null;
        }

        if (typeof parsedData.totalTimeMs !== "number") {
            return null;
        }

        const steps = Array.isArray(parsedData.steps)
            ? parsedData.steps.filter(
                  (step): step is StepResponse =>
                      !!step &&
                      typeof step === "object" &&
                      typeof step.step === "string" &&
                      typeof step.timeMs === "number"
              )
            : [];

        const failure =
            parsedData.failure &&
            typeof parsedData.failure === "object" &&
            typeof parsedData.failure.code === "string" &&
            typeof parsedData.failure.message === "string"
                ? {
                      code: parsedData.failure.code,
                      message: parsedData.failure.message,
                      details:
                          parsedData.failure.details && typeof parsedData.failure.details === "object"
                              ? parsedData.failure.details
                              : undefined,
                  }
                : undefined;

        return new Payment(parsedData.status, parsedData.transactionId, parsedData.totalTimeMs, steps, failure);
    }

    serialize(): string {
        return JSON.stringify({
            status: this.status,
            transactionId: this.transactionId,
            totalTimeMs: this.totalTimeMs,
            steps: this.steps,
            failure: this.failure,
        });
    }

    isFinalStatus(): boolean {
        return [PaymentStatus.Approved, PaymentStatus.Declined, PaymentStatus.Error].includes(this.status);
    }

    isInProgress(): boolean {
        return !this.isFinalStatus();
    }
}

export type PaymentSubscribePayload = {
    transactionId: string;
};
