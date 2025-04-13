import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import dotenv from 'dotenv';
import * as pkg from "../package.json" with { type: "json" };

dotenv.config();

console.info("=== Initializing OpenTelemetry SDK");

// Enable diagnostic logging for debugging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Trace exporter
const traceExporterUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4317";
console.info(`Using OTLP trace exporter with endpoint: ${traceExporterUrl}`);
const traceExporter = new OTLPTraceExporter({
	url: traceExporterUrl,
});

// Metric reader
const metricReaderPort = Number(process.env.PROMETHEUS_PORT) || 9464;
console.info(`Using Prometheus exporter with port: ${metricReaderPort}`);
const metricReader = new PrometheusExporter({
	port: metricReaderPort,
});

// SDK setup
console.info("Initializing OpenTelemetry SDK");
export const sdk = new NodeSDK({
	traceExporter,
	metricReader,
	instrumentations: [getNodeAutoInstrumentations()],
	// instrumentations: [
	// 	new PinoInstrumentation(),
	// 	new FastifyOtelInstrumentation.default({ registerOnInitialization: true }),
	// 	new HttpInstrumentation(),
	// ],
	resource: resourceFromAttributes({
		[ATTR_SERVICE_NAME]: pkg.default.name,
		[ATTR_SERVICE_VERSION]: pkg.default.version,
	}),
});

// Handle shutdown
process.on("SIGTERM", () => {
	sdk
		.shutdown()
		.then(
			() => console.info("Instrumentation terminated"),
			(error) => console.error("Error terminating instrumentation", error),
		)
		.finally(() => process.exit(0));
});
