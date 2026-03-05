import { ApplicationError } from "../application-error";

export class AntiFraudValidationFailedError extends ApplicationError {
    constructor(details?: Record<string, unknown>) {
        super("Anti-fraud validation failed", "ANTI_FRAUD_VALIDATION_FAILED", details);
    }
}
