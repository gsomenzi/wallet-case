import { Test, TestingModule } from "@nestjs/testing";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { PaymentRequest } from "./payment-request.dto";

describe("PaymentController", () => {
    let controller: PaymentController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentController],
            providers: [PaymentService],
        }).compile();

        controller = module.get<PaymentController>(PaymentController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });

    it("should create payment and return a response", async () => {
        const paymentRequest: PaymentRequest = {
            cardNumber: "4111111111111111",
            cardHolder: "John Doe",
            expirationDate: "12/25",
            cvv: "123",
            amount: 100.0,
        };

        const response = await controller.createPayment(paymentRequest);
        expect(response).toBeDefined();
        expect(response.status).toBeDefined();
        expect(response.transactionId).toBeDefined();
    });
});
