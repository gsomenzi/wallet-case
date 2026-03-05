import { DynamicModule, Global, Module } from "@nestjs/common";
import { createDelaySimulator, DelaySimulatorType } from "./delay-simulator.factory";
import { DelaySimulator } from "./delay-simulator.interface";

type DelaySimulatorModuleOptions = {
    type?: DelaySimulatorType;
};

@Global()
@Module({})
export class DelaySimulatorModule {
    static forRoot(options: DelaySimulatorModuleOptions = {}): DynamicModule {
        const { type = DelaySimulatorType.SetTimeout } = options;
        return {
            global: true,
            module: DelaySimulatorModule,
            providers: [
                {
                    provide: DelaySimulator,
                    useFactory: () => createDelaySimulator(type),
                },
            ],
            exports: [DelaySimulator],
        };
    }
}
