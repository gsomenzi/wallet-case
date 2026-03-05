import { Test, TestingModule } from "@nestjs/testing";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { PaymentRequest } from "./payment-request.dto";

describe("PaymentController", () => {
    let controller: PaymentController;
    const paymentServiceMock = {
        executePayment: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentController],
            providers: [
                {
                    provide: PaymentService,
                    useValue: paymentServiceMock,
                },
            ],
        }).compile();

        controller = module.get<PaymentController>(PaymentController);
        paymentServiceMock.executePayment.mockReset();
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

        paymentServiceMock.executePayment.mockResolvedValue({
            status: "approved",
            transactionId: "tx-123",
        });

        const response = await controller.createPayment(paymentRequest);
        expect(response).toBeDefined();
        expect(response.status).toBeDefined();
        expect(response.transactionId).toBeDefined();
        expect(paymentServiceMock.executePayment).toHaveBeenCalledWith(paymentRequest);
    });
});
