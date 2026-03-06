import { ApplicationError } from "../application-error";

export class PaymentProcessingFailedError extends ApplicationError {
    constructor(details?: Record<string, unknown>) {
        super("Falha ao processar o pagamento", "PAYMENT_PROCESSING_FAILED", details, { retryable: true });
    }
}
