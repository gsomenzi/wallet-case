import { ApplicationError } from "../application-error";

export class NotificationSendingFailedError extends ApplicationError {
    constructor(details?: Record<string, unknown>) {
        super("Notification sending failed", "NOTIFICATION_SENDING_FAILED", details);
    }
}
