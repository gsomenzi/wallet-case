export interface PaymentProcessor {
    process(): Promise<void>;
}

export const PaymentProcessor = Symbol("PaymentProcessor");
