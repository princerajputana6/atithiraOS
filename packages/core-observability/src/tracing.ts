import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { getEnv } from "@atithira/config";
import { logger } from "./logger";

let started = false;

/**
 * Starts the Node OpenTelemetry SDK once per process. Exports to
 * OTEL_EXPORTER_OTLP_ENDPOINT when set (the otel-collector in
 * docker-compose.yml listens on :4318) — with no endpoint configured the
 * exporter just fails its HTTP calls silently in the background rather than
 * crashing the app, so this is safe to always call at boot.
 */
export function startTracing(): void {
  if (started) return;
  started = true;

  const env = getEnv();
  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: "atithira-web",
    }),
    traceExporter: new OTLPTraceExporter({
      url: env.OTEL_EXPORTER_OTLP_ENDPOINT
        ? `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
        : "http://localhost:4318/v1/traces",
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  try {
    sdk.start();
    logger.info({ endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT }, "tracing started");
  } catch (err) {
    logger.warn({ err }, "failed to start tracing — continuing without it");
  }
}
