import { Payment, PaymentStatus } from "./payment.entity";

describe("Payment", () => {
    it("should create a default Payment instance", () => {
        const payment = Payment.create();
        expect(payment).toBeInstanceOf(Payment);
        expect(payment.status).toBe(PaymentStatus.Pending);
        expect(payment.transactionId).toBeDefined();
        expect(payment.transactionId.length).toBeGreaterThan(0);
        expect(payment.totalTimeMs).toBe(0);
        expect(payment.steps).toEqual([]);
        expect(payment.failure).toBeUndefined();
    });

    it("should add a step and update total time", () => {
        const payment = Payment.create();
        const step = { step: "test_step", timeMs: 150 };
        payment.addStep(step);
        expect(payment.steps).toContain(step);
        expect(payment.totalTimeMs).toBe(150);
    });

    it("should approve the payment", () => {
        const payment = Payment.create();
        payment.approve();
        expect(payment.status).toBe(PaymentStatus.Approved);
    });

    it("should decline the payment", () => {
        const payment = Payment.create();
        payment.decline();
        expect(payment.status).toBe(PaymentStatus.Declined);
    });

    it("should set the payment status to error", () => {
        const payment = Payment.create();
        payment.error();
        expect(payment.status).toBe(PaymentStatus.Error);
    });

    it("should attach failure details when declining", () => {
        const payment = Payment.create();
        payment.decline({
            code: "ACCOUNT_VALIDATION_FAILED",
            message: "Falha ao validar a conta",
            details: { minDelayMs: 450 },
        });

        expect(payment.status).toBe(PaymentStatus.Declined);
        expect(payment.failure).toEqual({
            code: "ACCOUNT_VALIDATION_FAILED",
            message: "Falha ao validar a conta",
            details: { minDelayMs: 450 },
        });
    });

    it("should clear failure when payment is approved", () => {
        const payment = Payment.create();
        payment.error({
            code: "UNKNOWN_APPLICATION_ERROR",
            message: "Erro inesperado",
        });

        payment.approve();

        expect(payment.status).toBe(PaymentStatus.Approved);
        expect(payment.failure).toBeUndefined();
    });
});
