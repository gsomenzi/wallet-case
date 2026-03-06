import { Payment, PaymentStatus } from "../../../features/payment/payment.entity";

const TERMINAL_STATUSES = new Set<PaymentStatus>([PaymentStatus.Approved, PaymentStatus.Declined, PaymentStatus.Error]);

export function isTerminalStatus(status: PaymentStatus): boolean {
    return TERMINAL_STATUSES.has(status);
}

export function hasStepAlreadyExecuted(payment: Payment, step: string): boolean {
    return payment.steps.some((executedStep) => executedStep.step === step);
}
