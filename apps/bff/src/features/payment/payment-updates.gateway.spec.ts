import { Test, TestingModule } from "@nestjs/testing";
import { PaymentStorage } from "../../infrastructure/persistence/payment-storage/payment-storage.interface";
import { Payment } from "./payment.entity";
import { PaymentUpdatesGateway } from "./payment-updates.gateway";

describe("PaymentUpdatesGateway", () => {
    let gateway: PaymentUpdatesGateway;
    let paymentStorage: { findByTransactionId: jest.Mock };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentUpdatesGateway,
                {
                    provide: PaymentStorage,
                    useValue: {
                        findByTransactionId: jest.fn(),
                    },
                },
            ],
        }).compile();

        gateway = module.get<PaymentUpdatesGateway>(PaymentUpdatesGateway);
        paymentStorage = module.get<{ findByTransactionId: jest.Mock }>(PaymentStorage);
    });

    it("should subscribe client to room and emit current payment", async () => {
        const payment = Payment.create();
        paymentStorage.findByTransactionId.mockResolvedValue(payment);

        const client = {
            join: jest.fn().mockResolvedValue(undefined),
            emit: jest.fn(),
        };

        await gateway.handleSubscribe(client as never, {
            transactionId: payment.transactionId,
        });

        expect(client.join).toHaveBeenCalledWith(`payment:${payment.transactionId}`);
        expect(client.emit).toHaveBeenCalledWith("payment.updated", payment);
    });

    it("should emit error when transactionId is missing", async () => {
        const client = {
            join: jest.fn().mockResolvedValue(undefined),
            emit: jest.fn(),
        };

        await gateway.handleSubscribe(client as never, { transactionId: "" });

        expect(client.join).not.toHaveBeenCalled();
        expect(client.emit).toHaveBeenCalledWith("payment.error", {
            message: "transactionId is required",
        });
    });
});
