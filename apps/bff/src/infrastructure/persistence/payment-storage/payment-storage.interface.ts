import { Payment } from "src/features/payment/payment.entity";

export interface PaymentStorage {
    save(payment: Payment): Promise<void>;
    findByTransactionId(transactionId: string): Promise<Payment | null>;
}

export const PaymentStorage = Symbol("PaymentStorage");
