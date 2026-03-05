import { Module } from "@nestjs/common";
import { BackendModule } from "./infrastructure/backend/backend.module";
import { BooleanRandomizerType } from "./infrastructure/boolean-randomizer/boolean-randomizer.factory";
import { BooleanRandomizerModule } from "./infrastructure/boolean-randomizer/boolean-randomizer.module";
import { DelaySimulatorModule } from "./infrastructure/delay-simulator/delay-simulator.module";
import { PaymentModule } from "./payment/payment.module";

@Module({
    imports: [
        BooleanRandomizerModule.forRoot({ type: BooleanRandomizerType.Default, trueProbability: 0.9 }),
        DelaySimulatorModule.forRoot(),
        BackendModule,
        PaymentModule,
    ],
})
export class AppModule {}
