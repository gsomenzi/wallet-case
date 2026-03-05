import { ApplicationError } from "../application-error";

export class NotificationSendingFailedError extends ApplicationError {
    constructor(details?: Record<string, unknown>) {
        super("Falha ao enviar a notificação", "NOTIFICATION_SENDING_FAILED", details);
    }
}
