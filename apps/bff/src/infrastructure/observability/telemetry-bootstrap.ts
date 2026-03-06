import "dotenv/config";
import { logs } from "@opentelemetry/api-logs";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_NAMESPACE,
    SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from "@opentelemetry/semantic-conventions";

const serviceName = process.env.OTEL_SERVICE_NAME ?? "bff";
const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_NAMESPACE]: process.env.OTEL_SERVICE_NAMESPACE ?? "wallet-case",
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV ?? "dev",
});

const sdk = new NodeSDK({
    resource,
    traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? "http://localhost:4318/v1/traces",
    }),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ?? "http://localhost:4318/v1/metrics",
        }),
        exportIntervalMillis: Number(process.env.OTEL_METRIC_EXPORT_INTERVAL_MS ?? "10000"),
    }),
    instrumentations: [getNodeAutoInstrumentations()],
});

let started = false;
let loggerProvider: LoggerProvider | undefined;

export async function startTelemetry(): Promise<void> {
    if (started) return;

    await sdk.start();

    loggerProvider = new LoggerProvider({
        resource,
        processors: [
            new BatchLogRecordProcessor(
                new OTLPLogExporter({
                    url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ?? "http://localhost:4318/v1/logs",
                })
            ),
        ],
    });
    logs.setGlobalLoggerProvider(loggerProvider);
    started = true;
}

export async function shutdownTelemetry(): Promise<void> {
    if (!started) return;

    await loggerProvider?.shutdown();
    await sdk.shutdown();

    loggerProvider = undefined;
    started = false;
}
