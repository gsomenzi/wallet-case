import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PaymentStatus } from "../../../features/payment/payment-response.entity";
import {
    PaymentWorkflowEvent,
    type PaymentWorkflowEventPayload,
} from "../../../features/payment/payment-workflow.events";
import { PaymentWorkflowCoordinator } from "../payment-workflow-coordinator.service";
import { NotificationSender, type NotificationSender as NotificationSenderType } from "./notification-sender.interface";

@Injectable()
export class NotificationRequestedProcessor {
    constructor(
        @Inject(NotificationSender) private readonly notificationSender: NotificationSenderType,
        private readonly paymentWorkflowCoordinator: PaymentWorkflowCoordinator
    ) {}

    @OnEvent(PaymentWorkflowEvent.NotificationRequested, { async: true })
    async handleNotificationRequested(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.paymentWorkflowCoordinator.execute({
            event,
            step: "notification",
            statusInProgress: PaymentStatus.SendingNotification,
            action: () => this.notificationSender.send(),
        });

        await this.paymentWorkflowCoordinator.completeAsApproved(event);
    }
}
