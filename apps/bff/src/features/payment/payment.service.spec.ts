import { Test, TestingModule } from "@nestjs/testing";
import { AccountValidator } from "../../infrastructure/backend/account-validator/account-validator.interface";
import { AcquirerProcessor } from "../../infrastructure/backend/acquirer-processor/acquirer-processor.interface";
import { AntiFraudValidator } from "../../infrastructure/backend/anti-fraud-validator/anti-fraud-validator.interface";
import { CardValidator } from "../../infrastructure/backend/card-validator/card-validator.interface";
import { NotificationSender } from "../../infrastructure/backend/notification-sender/notification-sender.interface";
import { PaymentProcessor } from "../../infrastructure/backend/payment-processor/payment-processor.interface";
import { PaymentService } from "./payment.service";
import { PaymentRequest } from "./payment-request.dto";
import { PaymentResponse, PaymentStatus } from "./payment-response.entity";

describe("PaymentService", () => {
    let service: PaymentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                {
                    provide: AccountValidator,
                    useValue: {
                        validate: jest.fn().mockResolvedValue(true),
                    },
                },
                {
                    provide: CardValidator,
                    useValue: {
                        validate: jest.fn().mockResolvedValue(true),
                    },
                },
                {
                    provide: AntiFraudValidator,
                    useValue: {
                        validate: jest.fn().mockResolvedValue(true),
                    },
                },
                {
                    provide: AcquirerProcessor,
                    useValue: {
                        process: jest.fn().mockResolvedValue(undefined),
                    },
                },
                {
                    provide: PaymentProcessor,
                    useValue: {
                        process: jest.fn().mockResolvedValue(undefined),
                    },
                },
                {
                    provide: NotificationSender,
                    useValue: {
                        send: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
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
        const response = await service.executePayment(request);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(PaymentResponse);
        expect(response.status).toBe(PaymentStatus.Approved);
        expect(response.transactionId).toBeDefined();
        expect(response.totalTimeMs).toBeGreaterThanOrEqual(0);
        expect(response.steps.length).toBe(6);
        response.steps.forEach((step) => {
            expect(step.timeMs).toBeGreaterThanOrEqual(0);
            expect(step.step).toBeDefined();
        });
    });
});
