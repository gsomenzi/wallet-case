import type { Theme } from "@/constants/theme";
import { type Payment, PaymentStatus } from "@/features/payment/payment.entity";

export type PaymentFeedbackStatusColorToken = keyof Pick<
    Theme["colors"],
    "primary" | "success" | "danger" | "secondary"
>;

export function getPaymentStatusLabel(payment: Payment): string {
    switch (payment.status) {
        case PaymentStatus.Pending:
            return "Pendente";
        case PaymentStatus.ValidatingAccount:
            return "Validando conta";
        case PaymentStatus.ValidatingCard:
            return "Validando cartão";
        case PaymentStatus.ValidatingAntifraud:
            return "Analisando antifraude";
        case PaymentStatus.ProcessingAcquirer:
            return "Processando adquirente";
        case PaymentStatus.ProcessingPayment:
            return "Processando pagamento";
        case PaymentStatus.SendingNotification:
            return "Enviando notificação";
        case PaymentStatus.Approved:
            return "Aprovado";
        case PaymentStatus.Declined:
            return "Recusado";
        case PaymentStatus.Error:
            return "Erro";
        default:
            return payment.status;
    }
}

export function getPaymentStatusColorToken(payment: Payment): PaymentFeedbackStatusColorToken {
    switch (payment.status) {
        case PaymentStatus.Approved:
            return "success";
        case PaymentStatus.Declined:
        case PaymentStatus.Error:
            return "danger";
        default:
            return "primary";
    }
}

export function getPaymentTotalTimeLabel(payment: Payment): string {
    return payment.isFinalStatus() ? `${payment.totalTimeMs}ms` : "Em andamento";
}

export function getPaymentFailureMessage(payment: Payment): string | null {
    if (!payment.failure?.message) {
        return null;
    }

    return payment.failure.message;
}
