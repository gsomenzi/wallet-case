import { ApplicationError } from "../application-error";

export class PaymentProcessingFailedError extends ApplicationError {
    constructor(details?: Record<string, unknown>) {
        super("Payment processing failed", "PAYMENT_PROCESSING_FAILED", details);
    }
}
