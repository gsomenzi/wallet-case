import { Injectable } from "@nestjs/common";
import { Payment } from "src/features/payment/payment.entity";
import { PaymentStorage } from "../payment-storage.interface";

@Injectable()
export class InMemoryPaymentStorage implements PaymentStorage {
    private readonly storage = new Map<string, Payment>();

    async save(payment: Payment): Promise<void> {
        this.storage.set(payment.transactionId, payment);
    }

    async findByTransactionId(transactionId: string): Promise<Payment | null> {
        return this.storage.get(transactionId) ?? null;
    }
}
