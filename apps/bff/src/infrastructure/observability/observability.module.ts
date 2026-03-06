import { DynamicModule, Global, Module } from "@nestjs/common";
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
                    provide: TraceInstrumenter,
                    useClass: OtelTraceInstrumenter,
                },
            ],
            exports: [TraceInstrumenter],
        };
    }
}
