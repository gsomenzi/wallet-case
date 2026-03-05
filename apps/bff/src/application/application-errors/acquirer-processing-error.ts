import { ApplicationError } from "../application-error";

export class AcquirerProcessingFailedError extends ApplicationError {
    constructor(details?: Record<string, unknown>) {
        super("Acquirer processing failed", "ACQUIRER_PROCESSING_FAILED", details);
    }
}
