import { Module } from "@nestjs/common";
import { AccountValidator } from "./account-validator/account-validator.interface";
import { MockAccountValidator } from "./account-validator/implementations/mock-account-validator";
import { AcquirerProcessor } from "./acquirer-processor/acquirer-processor.interface";
import { MockAcquirerProcessor } from "./acquirer-processor/implementations/mock-acquirer-processor";
import { AntiFraudValidator } from "./anti-fraud-validator/anti-fraud-validator.interface";
import { MockAntiFraudValidator } from "./anti-fraud-validator/implementations/mock-anti-fraud-validator";
import { CardValidator } from "./card-validator/card-validator.interface";
import { MockCardValidator } from "./card-validator/implementations/mock-card-validator";
import { MockNotificationSender } from "./notification-sender/implementations/mock-notification-sender";
import { NotificationSender } from "./notification-sender/notification-sender.interface";
import { MockPaymentProcessor } from "./payment-processor/implementations/mock-payment-processor";
import { PaymentProcessor } from "./payment-processor/payment-processor.interface";

@Module({
    providers: [
        {
            provide: AccountValidator,
            useClass: MockAccountValidator,
        },
        {
            provide: AcquirerProcessor,
            useClass: MockAcquirerProcessor,
        },
        {
            provide: AntiFraudValidator,
            useClass: MockAntiFraudValidator,
        },
        {
            provide: CardValidator,
            useClass: MockCardValidator,
        },
        {
            provide: NotificationSender,
            useClass: MockNotificationSender,
        },
        {
            provide: PaymentProcessor,
            useClass: MockPaymentProcessor,
        },
    ],
    exports: [
        AccountValidator,
        AcquirerProcessor,
        AntiFraudValidator,
        CardValidator,
        NotificationSender,
        PaymentProcessor,
    ],
})
export class BackendModule {}
