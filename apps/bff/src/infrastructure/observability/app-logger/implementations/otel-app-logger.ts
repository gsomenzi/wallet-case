import { Injectable } from "@nestjs/common";
import { isSpanContextValid, context as otelContext, trace } from "@opentelemetry/api";
import { logs } from "@opentelemetry/api-logs";
import { AppLogger } from "../app-logger.interface";

type LogLevel = "INFO" | "WARN" | "ERROR";

@Injectable()
export class OtelAppLogger implements AppLogger {
    private readonly logger = logs.getLogger("bff-app-logger");

    info(message: string, context?: Record<string, unknown>): void {
        this.write("INFO", message, context);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        this.write("WARN", message, context);
    }

    error(message: string, context?: Record<string, unknown>): void {
        this.write("ERROR", message, context);
    }

    private write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
        const activeContext = otelContext.active();
        const span = trace.getSpan(activeContext) ?? trace.getActiveSpan();
        const spanContext = span?.spanContext();
        const hasActiveSpan = !!spanContext && isSpanContextValid(spanContext);
        const { event, ...remainingContext } = context ?? {};
        const eventName = this.resolveEventName(event, message);

        this.logger.emit({
            context: activeContext,
            severityText: level,
            body: message,
            attributes: {
                service: process.env.OTEL_SERVICE_NAME ?? "bff",
                level: level.toLowerCase(),
                event_name: eventName,
                "loki.attribute.labels": "service,level,event_name,context",
                has_active_span: hasActiveSpan,
                trace_id: spanContext?.traceId,
                span_id: spanContext?.spanId,
                ...remainingContext,
            },
        });
    }

    private resolveEventName(event: unknown, message: string): string {
        if (typeof event === "string" && event.trim().length > 0) {
            return this.normalizeEventName(event);
        }

        return this.normalizeEventName(message);
    }

    private normalizeEventName(value: string): string {
        return value
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "")
            .replace(/_{2,}/g, "_");
    }
}
