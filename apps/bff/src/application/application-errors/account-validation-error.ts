import { ApplicationError } from "../application-error";

export class AccountValidationFailedError extends ApplicationError {
    constructor(details?: Record<string, unknown>) {
        super("Account validation failed", "ACCOUNT_VALIDATION_FAILED", details);
    }
}
