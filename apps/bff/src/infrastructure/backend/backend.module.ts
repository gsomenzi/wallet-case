import { Module } from "@nestjs/common";
import { PersistenceModule } from "../persistence/persistence.module";
import { AccountValidationRequestedProcessor } from "./account-validator/account-validation-requested.processor";
import { AccountValidator } from "./account-validator/account-validator.interface";
import { MockAccountValidator } from "./account-validator/implementations/mock-account-validator";
import { AcquirerProcessingRequestedProcessor } from "./acquirer-processor/acquirer-processing-requested.processor";
import { AcquirerProcessor } from "./acquirer-processor/acquirer-processor.interface";
import { MockAcquirerProcessor } from "./acquirer-processor/implementations/mock-acquirer-processor";
import { AntiFraudValidator } from "./anti-fraud-validator/anti-fraud-validator.interface";
import { AntifraudValidationRequestedProcessor } from "./anti-fraud-validator/antifraud-validation-requested.processor";
import { MockAntiFraudValidator } from "./anti-fraud-validator/implementations/mock-anti-fraud-validator";
import { CardValidationRequestedProcessor } from "./card-validator/card-validation-requested.processor";
import { CardValidator } from "./card-validator/card-validator.interface";
import { MockCardValidator } from "./card-validator/implementations/mock-card-validator";
import { MockNotificationSender } from "./notification-sender/implementations/mock-notification-sender";
import { NotificationRequestedProcessor } from "./notification-sender/notification-requested.processor";
import { NotificationSender } from "./notification-sender/notification-sender.interface";
import { MockPaymentProcessor } from "./payment-processor/implementations/mock-payment-processor";
import { PaymentProcessingRequestedProcessor } from "./payment-processor/payment-processing-requested.processor";
import { PaymentProcessor } from "./payment-processor/payment-processor.interface";
import { PaymentStartedProcessor } from "./payment-started.processor";
import { PaymentWorkflowCoordinator } from "./payment-workflow-coordinator.service";

@Module({
    imports: [PersistenceModule],
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
        PaymentWorkflowCoordinator,
        PaymentStartedProcessor,
        AccountValidationRequestedProcessor,
        CardValidationRequestedProcessor,
        AntifraudValidationRequestedProcessor,
        AcquirerProcessingRequestedProcessor,
        PaymentProcessingRequestedProcessor,
        NotificationRequestedProcessor,
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
