import { Injectable } from "@nestjs/common";
import { Attributes, SpanStatusCode, trace } from "@opentelemetry/api";
import { TraceInstrumenter } from "../trace-instrumenter.interface";

@Injectable()
export class OtelTraceInstrumenter implements TraceInstrumenter {
    private readonly tracer = trace.getTracer("bff-tracer");
    async usingSpan<T>(name: string, attributes: Attributes = {}, fn: () => Promise<T> | T): Promise<T> {
        return this.tracer.startActiveSpan(name, async (span) => {
            try {
                span.setAttributes(attributes);
                const result = await fn();
                span.setStatus({ code: SpanStatusCode.OK });
                return result;
            } catch (error) {
                if (error instanceof Error) {
                    span.recordException(error);
                }
                span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: error instanceof Error ? error.message : "unknown error",
                });
                throw error;
            } finally {
                span.end();
            }
        });
    }
}
