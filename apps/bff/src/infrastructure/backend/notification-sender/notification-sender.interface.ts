export interface NotificationSender {
    send(): Promise<void>;
}

export const NotificationSender = Symbol("NotificationSender");
