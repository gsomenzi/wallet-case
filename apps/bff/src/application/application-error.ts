export type ApplicationErrorCode =
    | "ACCOUNT_VALIDATION_FAILED"
    | "CARD_VALIDATION_FAILED"
    | "ANTI_FRAUD_VALIDATION_FAILED"
    | "ACQUIRER_PROCESSING_FAILED"
    | "PAYMENT_PROCESSING_FAILED"
    | "NOTIFICATION_SENDING_FAILED"
    | "INSUFFICIENT_FUNDS"
    | "ACCOUNT_NOT_FOUND"
    | "UNKNOWN_APPLICATION_ERROR";

export abstract class ApplicationError extends Error {
    readonly code: ApplicationErrorCode;
    readonly details?: Record<string, unknown>;
    readonly retryable: boolean;

    protected constructor(
        message: string,
        code: ApplicationErrorCode,
        details?: Record<string, unknown>,
        options?: { cause?: unknown; retryable?: boolean }
    ) {
        super(message);
        this.name = new.target.name;
        this.code = code;
        this.details = details;
        this.retryable = options?.retryable ?? false;
        if (options?.cause) {
            (this as Error & { cause?: unknown }).cause = options.cause;
        }
    }
}
