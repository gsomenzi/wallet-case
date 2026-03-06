import { Injectable } from "@nestjs/common";
import { Meter, metrics, ValueType } from "@opentelemetry/api";
import { MetricRecorder } from "../metric-recorder.interface";

@Injectable()
export class OtelMetricRecorder implements MetricRecorder {
    private readonly meter: Meter = metrics.getMeter("bff-metrics");
    private readonly counters = new Map<string, ReturnType<Meter["createCounter"]>>();
    private readonly histograms = new Map<string, ReturnType<Meter["createHistogram"]>>();

    incrementCounter(name: string, value = 1, attributes?: Record<string, string | number | boolean>): void {
        const counter = this.getOrCreateCounter(name);
        counter.add(value, attributes);
    }

    recordHistogram(name: string, value: number, attributes?: Record<string, string | number | boolean>): void {
        const histogram = this.getOrCreateHistogram(name);
        histogram.record(value, attributes);
    }

    private getOrCreateCounter(name: string) {
        const existing = this.counters.get(name);
        if (existing) {
            return existing;
        }

        const created = this.meter.createCounter(name, {
            valueType: ValueType.INT,
        });
        this.counters.set(name, created);
        return created;
    }

    private getOrCreateHistogram(name: string) {
        const existing = this.histograms.get(name);
        if (existing) {
            return existing;
        }

        const created = this.meter.createHistogram(name, {
            valueType: ValueType.DOUBLE,
            unit: "ms",
        });
        this.histograms.set(name, created);
        return created;
    }
}
