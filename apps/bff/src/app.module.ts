import { Module } from "@nestjs/common";
import { BackendModule } from "./infrastructure/backend/backend.module";
import { DelaySimulatorModule } from "./infrastructure/delay-simulator/delay-simulator.module";
import { PaymentModule } from "./payment/payment.module";

@Module({
    imports: [DelaySimulatorModule.forRoot(), PaymentModule, BackendModule],
})
export class AppModule {}
