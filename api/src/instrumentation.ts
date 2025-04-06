import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import * as pkg from "../package.json" with { type: "json" };

export const sdk = new NodeSDK({
    traceExporter: new ConsoleSpanExporter(),
    instrumentations: [
        getNodeAutoInstrumentations(),
    ],
    metricReader: new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(),
    }),
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: pkg.default.name,
        [ATTR_SERVICE_VERSION]: pkg.default.version,
    })
});

sdk.start();

process.on("SIGTERM", () => {
    sdk.shutdown()
        .then(
            () => console.log("Instrumentation terminated"),
            (error) => console.log("Error terminating instrumentation", error)
        )
        .finally(() => process.exit(0));
});
