import type { PaymentResponse } from "./payment-response.entity";

export enum PaymentWorkflowEvent {
    PaymentStarted = "payment.workflow.started",
    AccountValidationRequested = "payment.workflow.account-validation.requested",
    CardValidationRequested = "payment.workflow.card-validation.requested",
    AntifraudValidationRequested = "payment.workflow.antifraud-validation.requested",
    AcquirerProcessingRequested = "payment.workflow.acquirer-processing.requested",
    PaymentProcessingRequested = "payment.workflow.payment-processing.requested",
    NotificationRequested = "payment.workflow.notification.requested",
    PaymentUpdated = "payment.workflow.payment-updated",
}

export type PaymentWorkflowEventPayload = {
    transactionId: string;
};

export type PaymentUpdatedEventPayload = {
    transactionId: string;
    payment: PaymentResponse;
};
