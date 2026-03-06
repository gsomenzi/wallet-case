import { DynamicModule, Global, Module } from "@nestjs/common";
import { AppLogger } from "./app-logger/app-logger.interface";
import { OtelAppLogger } from "./app-logger/implementations/otel-app-logger";
import { OtelMetricRecorder } from "./metric-recorder/implementations/otel-metric-recorder";
import { MetricRecorder } from "./metric-recorder/metric-recorder.interface";
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
                {
                    provide: MetricRecorder,
                    useClass: OtelMetricRecorder,
                },
            ],
            exports: [AppLogger, TraceInstrumenter, MetricRecorder],
        };
    }
}
