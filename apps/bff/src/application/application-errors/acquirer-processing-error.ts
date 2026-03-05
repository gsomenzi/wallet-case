import { ApplicationError } from "../application-error";

export class AcquirerProcessingFailedError extends ApplicationError {
    constructor(details?: Record<string, unknown>) {
        super("Falha ao processar a adquirente", "ACQUIRER_PROCESSING_FAILED", details);
    }
}
