import { Injectable } from "@nestjs/common";
import { PaymentResponse } from "src/features/payment/payment-response.entity";
import { PaymentStorage } from "../payment-storage.interface";

@Injectable()
export class InMemoryPaymentStorage implements PaymentStorage {
    private readonly storage = new Map<string, PaymentResponse>();

    async save(payment: PaymentResponse): Promise<void> {
        this.storage.set(payment.transactionId, payment);
    }

    async findByTransactionId(transactionId: string): Promise<PaymentResponse | null> {
        return this.storage.get(transactionId) ?? null;
    }
}
