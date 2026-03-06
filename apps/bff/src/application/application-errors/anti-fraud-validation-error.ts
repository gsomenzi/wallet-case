import { ApplicationError } from "../application-error";

export class AntiFraudValidationFailedError extends ApplicationError {
    constructor(details?: Record<string, unknown>) {
        super("Falha ao validar a antifraude", "ANTI_FRAUD_VALIDATION_FAILED", details, { retryable: true });
    }
}
