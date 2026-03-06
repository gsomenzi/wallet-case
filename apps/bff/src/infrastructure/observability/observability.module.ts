import { DynamicModule, Global, Module } from "@nestjs/common";
import { AppLogger } from "./app-logger/app-logger.interface";
import { OtelAppLogger } from "./app-logger/implementations/otel-app-logger";
import { OtelTraceInstrumenter } from "./trace-instrumenter/implementations/otel-trace-instrumenter";
import { TraceInstrumenter } from "./trace-instrumenter/trace-instrumenter.interface";

@Global()
@Module({})
export class ObservabilityModule {
    static forRoot(): DynamicModule {
        return {
            global: true,
            module: ObservabilityModule,
            providers: [
                {
                    provide: AppLogger,
                    useClass: OtelAppLogger,
                },
                {
                    provide: TraceInstrumenter,
                    useClass: OtelTraceInstrumenter,
                },
            ],
            exports: [AppLogger, TraceInstrumenter],
        };
    }
}
