import { ApplicationError } from "../application-error";

export class CardValidationFailedError extends ApplicationError {
    constructor(details?: Record<string, unknown>) {
        super("Card validation failed", "CARD_VALIDATION_FAILED", details);
    }
}
