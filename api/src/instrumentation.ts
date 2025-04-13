import FastifyOtelInstrumentation from "@fastify/otel";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { PinoInstrumentation } from "@opentelemetry/instrumentation-pino";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK, type NodeSDKConfiguration } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import dotenv from 'dotenv';
import * as pkg from "../package.json" with { type: "json" };

dotenv.config();

export function initializeTracing(debug: boolean) {
	// Enable diagnostic logging for debugging
	diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

	// NodeSDK configuration
	let sdkConfig: Partial<NodeSDKConfiguration> = {
		instrumentations: [
			new PinoInstrumentation(),
			new FastifyOtelInstrumentation.default({ registerOnInitialization: true }),
			new HttpInstrumentation(),
		],
		resource: resourceFromAttributes({
			[ATTR_SERVICE_NAME]: pkg.default.name,
			[ATTR_SERVICE_VERSION]: pkg.default.version,
		}),
	};

	// Trace exporter
	if (debug) {
		sdkConfig.traceExporter = new ConsoleSpanExporter();
	} else {
		const url = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4317";
		console.info(`Using OTLP trace exporter with endpoint: ${url}`);
		sdkConfig.traceExporter = new OTLPTraceExporter({
			url: url,
		});
	}

	// Metric reader
	if (debug) {
		sdkConfig.metricReader = new PeriodicExportingMetricReader({
			exporter: new ConsoleMetricExporter(),
		});
	} else {
		const port = Number(process.env.PROMETHEUS_PORT) || 9464;
		console.info(`Using Prometheus exporter with port: ${port}`);
		sdkConfig.metricReader = new PrometheusExporter({
			port: Number(process.env.PROMETHEUS_PORT) || 9464,
		});
	}

	// // Tracer provider
	// const provider = new NodeTracerProvider();
	// provider.register();

	// // Fastify instrumentation
	// const fastifyOtelInstrumentation = new FastifyOtelInstrumentation.default({ registerOnInitialization: true });
	// fastifyOtelInstrumentation.setTracerProvider(provider);

	// SDK setup
	const sdk = new NodeSDK(sdkConfig);

	// Start SDK
	sdk.start();

	// Handle shutdown
	process.on("SIGTERM", () => {
		sdk
			.shutdown()
			.then(
				() => console.log("Instrumentation terminated"),
				(error) => console.log("Error terminating instrumentation", error),
			)
			.finally(() => process.exit(0));
	});

	return sdk;
}
