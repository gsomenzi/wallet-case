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

        this.logger.emit({
            context: activeContext,
            severityText: level,
            body: message,
            attributes: {
                service: process.env.OTEL_SERVICE_NAME ?? "bff",
                has_active_span: hasActiveSpan,
                trace_id: spanContext?.traceId,
                span_id: spanContext?.spanId,
                ...context,
            },
        });
    }
}
