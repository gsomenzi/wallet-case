import { PaymentResponse } from "src/features/payment/payment-response.entity";

export interface PaymentStorage {
    save(payment: PaymentResponse): Promise<void>;
    findByTransactionId(transactionId: string): Promise<PaymentResponse | null>;
}

export const PaymentStorage = Symbol("PaymentStorage");
