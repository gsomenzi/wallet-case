import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { GlobalExceptionFilter } from "./application/global-exception-filter";
import { PaymentModule } from "./features/payment/payment.module";
import { BackendModule } from "./infrastructure/backend/backend.module";
import { BooleanRandomizerType } from "./infrastructure/boolean-randomizer/boolean-randomizer.factory";
import { BooleanRandomizerModule } from "./infrastructure/boolean-randomizer/boolean-randomizer.module";
import { DelaySimulatorModule } from "./infrastructure/delay-simulator/delay-simulator.module";
import { ObservabilityModule } from "./infrastructure/observability/observability.module";
import { PersistenceModule } from "./infrastructure/persistence/persistence.module";

@Module({
    imports: [
        EventEmitterModule.forRoot(),
        BooleanRandomizerModule.forRoot({ type: BooleanRandomizerType.Default, trueProbability: 0.9 }),
        DelaySimulatorModule.forRoot(),
        ObservabilityModule.forRoot(),
        BackendModule,
        PersistenceModule,
        PaymentModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionFilter,
        },
    ],
})
export class AppModule {}
