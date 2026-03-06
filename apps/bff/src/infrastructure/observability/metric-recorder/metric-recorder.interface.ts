export interface MetricRecorder {
    incrementCounter(name: string, value?: number, attributes?: Record<string, string | number | boolean>): void;
    recordHistogram(name: string, value: number, attributes?: Record<string, string | number | boolean>): void;
}

export const MetricRecorder = Symbol("MetricRecorder");
