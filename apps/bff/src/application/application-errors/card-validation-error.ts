import { ApplicationError } from "../application-error";

export class CardValidationFailedError extends ApplicationError {
    constructor(details?: Record<string, unknown>) {
        super("Falha ao validar o cartão", "CARD_VALIDATION_FAILED", details);
    }
}
