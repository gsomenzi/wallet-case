import { DynamicModule, Global, Module } from "@nestjs/common";
import { CreateBooleanRandomizerOptions, createBooleanRandomizer } from "./boolean-randomizer.factory";
import { BooleanRandomizer } from "./boolean-randomizer.interface";

@Global()
@Module({})
export class BooleanRandomizerModule {
    static forRoot(options: CreateBooleanRandomizerOptions): DynamicModule {
        return {
            global: true,
            module: BooleanRandomizerModule,
            providers: [
                {
                    provide: BooleanRandomizer,
                    useFactory: () => createBooleanRandomizer(options),
                },
            ],
            exports: [BooleanRandomizer],
        };
    }
}
