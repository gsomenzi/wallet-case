import { ApplicationError } from "../application-error";

export class AccountValidationFailedError extends ApplicationError {
    constructor(details?: Record<string, unknown>) {
        super("Falha ao validar a conta", "ACCOUNT_VALIDATION_FAILED", details);
    }
}
