import { ApplicationError } from "../../../application/application-error";
import { PaymentResponse, PaymentStatus } from "../../../features/payment/payment-response.entity";

export function applyWorkflowFailure(payment: PaymentResponse, error: unknown): "declined" | "error" {
    if (error instanceof ApplicationError) {
        payment.decline({
            code: error.code,
            message: error.message,
            details: error.details,
        });
    } else {
        payment.error({
            code: "UNKNOWN_APPLICATION_ERROR",
            message: error instanceof Error ? error.message : "Erro inesperado ao processar pagamento",
        });
    }

    return payment.status === PaymentStatus.Declined ? "declined" : "error";
}
