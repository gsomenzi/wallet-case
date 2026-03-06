import { Inject, Injectable } from "@nestjs/common";
import { PaymentStatus } from "../../../features/payment/payment.entity";
import { type PaymentWorkflowEventPayload } from "../../../features/payment/payment-workflow.events";
import { PaymentWorkflowCoordinator } from "../payment-workflow/payment-workflow-coordinator.service";
import { NotificationSender, type NotificationSender as NotificationSenderType } from "./notification-sender.interface";

@Injectable()
export class NotificationRequestedProcessor {
    constructor(
        @Inject(NotificationSender)
        private readonly notificationSender: NotificationSenderType,
        private readonly paymentWorkflowCoordinator: PaymentWorkflowCoordinator
    ) {}

    async handle(event: PaymentWorkflowEventPayload): Promise<void> {
        await this.paymentWorkflowCoordinator.execute({
            event,
            step: "notification",
            statusInProgress: PaymentStatus.SendingNotification,
            action: () => this.notificationSender.send(),
            failureBehavior: "continue",
            retryPolicy: {
                maxAttempts: 3,
                initialDelayMs: 100,
                backoffFactor: 2,
                jitterMs: 80,
                timeoutMs: 2500,
            },
        });

        await this.paymentWorkflowCoordinator.completeAsApproved(event);
    }
}
