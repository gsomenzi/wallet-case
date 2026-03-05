import { createHttpClient } from "@/infrastructure/http-client/http-client.factory";
import { PaymentRequest } from "./payment-request.dto";

export class PaymentService {
    httpClient = createHttpClient();

    async processPayment(payload: PaymentRequest) {
        try {
            const response = await this.httpClient.post("/payments", payload);
            return response;
        } catch (error) {
            console.error("Payment processing failed:", error);
            throw error;
        }
    }
}
