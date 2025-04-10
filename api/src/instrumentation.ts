import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import * as pkg from "../package.json" with { type: "json" };
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

// Enable diagnostic logging for debugging
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

export function setupTelemetry(otelUrl: string, prometheusUrl: string) {
	const sdk = new NodeSDK({
		traceExporter: new OTLPTraceExporter({
			url: otelUrl,
		}),
		instrumentations: [getNodeAutoInstrumentations()],
		metricReader: new PrometheusExporter({
			port: 9464,
		}),
		resource: resourceFromAttributes({
			[ATTR_SERVICE_NAME]: pkg.default.name,
			[ATTR_SERVICE_VERSION]: pkg.default.version,
		}),
	});

	sdk.start();

	process.on("SIGTERM", () => {
		sdk
			.shutdown()
			.then(
				() => console.log("Instrumentation terminated"),
				(error) => console.log("Error terminating instrumentation", error),
			)
			.finally(() => process.exit(0));
	});
}
