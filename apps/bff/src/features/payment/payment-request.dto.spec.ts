import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { PaymentRequest } from "./payment-request.dto";

describe("PaymentRequest", () => {
    const buildValidPayload = () => ({
        cardNumber: "4111111111111111",
        cardHolder: "John Doe",
        expirationDate: "12/25",
        cvv: "123",
        amount: 100.0,
    });

    it("should pass validation with valid data", async () => {
        const paymentRequest = plainToInstance(PaymentRequest, buildValidPayload());
        const errors = await validate(paymentRequest);
        expect(errors).toHaveLength(0);
    });

    it("should apply transformations before validation", async () => {
        const paymentRequest = plainToInstance(PaymentRequest, {
            ...buildValidPayload(),
            cardNumber: "4111 1111 1111 1111",
            cardHolder: "  John Doe  ",
            expirationDate: " 12/25 ",
            cvv: " 123 ",
            amount: "100.50",
        });

        const errors = await validate(paymentRequest);

        expect(errors).toHaveLength(0);
        expect(paymentRequest.cardNumber).toBe("4111111111111111");
        expect(paymentRequest.cardHolder).toBe("John Doe");
        expect(paymentRequest.expirationDate).toBe("12/25");
        expect(paymentRequest.cvv).toBe("123");
        expect(paymentRequest.amount).toBe(100.5);
    });

    it("should fail validation with invalid fields", async () => {
        const paymentRequest = plainToInstance(PaymentRequest, {
            cardNumber: "4111-1111",
            cardHolder: "Jo",
            expirationDate: "13/30",
            cvv: "12a",
            amount: 0,
        });

        const errors = await validate(paymentRequest);
        const errorProperties = errors.map((error) => error.property);

        expect(errorProperties).toEqual(
            expect.arrayContaining(["cardNumber", "cardHolder", "expirationDate", "cvv", "amount"])
        );
    });
});
