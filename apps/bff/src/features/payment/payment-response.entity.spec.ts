import { PaymentResponse, PaymentStatus } from "./payment-response.entity";

describe("PaymentResponse", () => {
    it("should create a default PaymentResponse instance", () => {
        const paymentResponse = PaymentResponse.create();
        expect(paymentResponse).toBeInstanceOf(PaymentResponse);
        expect(paymentResponse.status).toBe(PaymentStatus.Pending);
        expect(paymentResponse.transactionId).toBeDefined();
        expect(paymentResponse.transactionId.length).toBeGreaterThan(0);
        expect(paymentResponse.totalTimeMs).toBe(0);
        expect(paymentResponse.steps).toEqual([]);
    });

    it("should add a step and update total time", () => {
        const paymentResponse = PaymentResponse.create();
        const step = { step: "test_step", timeMs: 150 };
        paymentResponse.addStep(step);
        expect(paymentResponse.steps).toContain(step);
        expect(paymentResponse.totalTimeMs).toBe(150);
    });

    it("should approve the payment", () => {
        const paymentResponse = PaymentResponse.create();
        paymentResponse.approve();
        expect(paymentResponse.status).toBe(PaymentStatus.Approved);
    });

    it("should decline the payment", () => {
        const paymentResponse = PaymentResponse.create();
        paymentResponse.decline();
        expect(paymentResponse.status).toBe(PaymentStatus.Declined);
    });

    it("should set the payment status to error", () => {
        const paymentResponse = PaymentResponse.create();
        paymentResponse.error();
        expect(paymentResponse.status).toBe(PaymentStatus.Error);
    });
});
