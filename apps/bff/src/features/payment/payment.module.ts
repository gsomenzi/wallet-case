import { Module } from "@nestjs/common";
import { BackendModule } from "src/infrastructure/backend/backend.module";
import { PersistenceModule } from "src/infrastructure/persistence/persistence.module";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { PaymentWorkflowService } from "./payment-workflow.service";

@Module({
    imports: [BackendModule, PersistenceModule],
    controllers: [PaymentController],
    providers: [PaymentService, PaymentWorkflowService],
})
export class PaymentModule {}
