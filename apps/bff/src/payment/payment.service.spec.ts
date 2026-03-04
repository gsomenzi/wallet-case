import { Test, TestingModule } from "@nestjs/testing";
import { PaymentService } from "./payment.service";
import { PaymentRequest } from "./payment-request.dto";
import { PaymentResponse, PaymentStatus } from "./payment-response.entity";

describe("PaymentService", () => {
    let service: PaymentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PaymentService],
        }).compile();

        service = module.get<PaymentService>(PaymentService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it("should process payment and return a valid response", async () => {
        const request: PaymentRequest = {
            cardNumber: "4111111111111111",
            cardHolder: "John Doe",
            expirationDate: "12/30",
            cvv: "123",
            amount: 100,
        };
        const response = await service.processPayment(request);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(PaymentResponse);
        expect(response.status).toBe(PaymentStatus.Approved);
        expect(response.transactionId).toBeDefined();
        expect(response.totalTimeMs).toBeGreaterThan(0);
        expect(response.steps.length).toBe(6);
        response.steps.forEach((step) => {
            expect(step.timeMs).toBeGreaterThan(0);
            expect(step.step).toBeDefined();
        });
    });
});
