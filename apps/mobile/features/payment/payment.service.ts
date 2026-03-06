import { createHttpClient } from "@/infrastructure/http-client/http-client.factory";
import { createWebSocketClient } from "@/infrastructure/websocket-client/websocket-client.factory";
import { Payment, type PaymentSubscribePayload } from "./payment.entity";
import { PaymentRequest } from "./payment-request.dto";

export class PaymentService {
    httpClient = createHttpClient();
    private readonly webSocketClient = createWebSocketClient();

    async processPayment(payload: PaymentRequest): Promise<Payment> {
        try {
            const paymentPayload = await this.httpClient.post("/payments", payload);
            const payment = Payment.deserialize(paymentPayload);
            if (!payment) {
                throw new Error("Failed to deserialize payment payload");
            }
            return payment;
        } catch (error) {
            console.error("Payment processing failed:", error);
            throw error;
        }
    }

    subscribePaymentUpdates(
        payload: PaymentSubscribePayload,
        onPaymentUpdated: (payment: Payment) => void,
        onConnectionChange?: (isConnected: boolean) => void
    ): () => void {
        return this.webSocketClient.subscribe({
            namespace: "payments",
            subscribeEvent: "payment.subscribe",
            subscribePayload: payload,
            messageEvent: "payment.updated",
            onMessage: onPaymentUpdated,
            onConnectionChange,
        });
    }
}
