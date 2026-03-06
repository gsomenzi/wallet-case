import { Module } from "@nestjs/common";
import { InMemoryPaymentStorage } from "./payment-storage/implementations/in-memory-payment-storage";
import { PaymentStorage } from "./payment-storage/payment-storage.interface";

@Module({
    providers: [
        {
            provide: PaymentStorage,
            useClass: InMemoryPaymentStorage,
        },
    ],
    exports: [PaymentStorage],
})
export class PersistenceModule {}
