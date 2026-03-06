import { Module } from "@nestjs/common";
import { BackendModule } from "src/infrastructure/backend/backend.module";
import { PersistenceModule } from "src/infrastructure/persistence/persistence.module";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { PaymentUpdatesGateway } from "./payment-updates.gateway";

@Module({
    imports: [BackendModule, PersistenceModule],
    controllers: [PaymentController],
    providers: [PaymentService, PaymentUpdatesGateway],
})
export class PaymentModule {}
