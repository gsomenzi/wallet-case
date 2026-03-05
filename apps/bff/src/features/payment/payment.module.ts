import { Module } from "@nestjs/common";
import { BackendModule } from "src/infrastructure/backend/backend.module";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";

@Module({
    imports: [BackendModule],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule {}
