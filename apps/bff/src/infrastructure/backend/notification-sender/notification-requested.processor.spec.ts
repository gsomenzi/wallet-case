import { Test, TestingModule } from "@nestjs/testing";
import { PaymentStatus } from "../../../features/payment/payment-response.entity";
import { PaymentWorkflowCoordinator } from "../payment-workflow/payment-workflow-coordinator.service";
import { NotificationRequestedProcessor } from "./notification-requested.processor";
import { NotificationSender } from "./notification-sender.interface";

describe("NotificationRequestedProcessor", () => {
    let processor: NotificationRequestedProcessor;
    const notificationSenderMock = {
        send: jest.fn().mockResolvedValue(undefined),
    };
    const paymentWorkflowCoordinatorMock = {
        execute: jest.fn().mockResolvedValue(undefined),
        completeAsApproved: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationRequestedProcessor,
                {
                    provide: NotificationSender,
                    useValue: notificationSenderMock,
                },
                {
                    provide: PaymentWorkflowCoordinator,
                    useValue: paymentWorkflowCoordinatorMock,
                },
            ],
        }).compile();

        processor = module.get(NotificationRequestedProcessor);
        notificationSenderMock.send.mockReset();
        notificationSenderMock.send.mockResolvedValue(undefined);
        paymentWorkflowCoordinatorMock.execute.mockReset();
        paymentWorkflowCoordinatorMock.execute.mockResolvedValue(undefined);
        paymentWorkflowCoordinatorMock.completeAsApproved.mockReset();
        paymentWorkflowCoordinatorMock.completeAsApproved.mockResolvedValue(undefined);
    });

    it("should execute notification as non-blocking and complete payment approval", async () => {
        const event = { transactionId: "tx-123" };

        await processor.handleNotificationRequested(event);

        expect(paymentWorkflowCoordinatorMock.execute).toHaveBeenCalledWith({
            event,
            step: "notification",
            statusInProgress: PaymentStatus.SendingNotification,
            action: expect.any(Function),
            failureBehavior: "continue",
            retryPolicy: {
                maxAttempts: 3,
                initialDelayMs: 100,
                backoffFactor: 2,
                jitterMs: 80,
                timeoutMs: 2500,
            },
        });

        expect(paymentWorkflowCoordinatorMock.completeAsApproved).toHaveBeenCalledWith(event);
    });
});
