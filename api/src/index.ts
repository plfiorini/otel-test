import { Command } from "commander";
import * as pkg from "../package.json" with { type: "json" };
import { startServer } from "./app.ts";
import { setupTelemetry } from "./instrumentation.ts";
import * as configLoader from "./core/config.ts";

const program = new Command();

program
	.version(pkg.default.version)
	.description("Typical ReST API server")
	.option(
		"-c, --config <path>",
		"Path to the configuration file",
		"./config/api.yaml",
	)
	.on("--help", () => {
		process.exit(0); // Exit the process after displaying help
	});

program.parse(process.argv);

const options = program.opts();
const configPath = options.config;
if (!configPath) {
	throw new Error("Configuration file path must be provided.");
}

console.debug(`Starting API with configuration file: ${configPath}`);
const config = configLoader.getConfig(configPath);
if (!config) {
	throw new Error("Failed to load configuration.");
}

setupTelemetry(config.otelUrl, config.prometheusUrl);

console.debug(`OpenTelemetry URL: ${config.otelUrl}`);
console.debug(`Prometheus URL Token: ${config.prometheusUrl}`);

startServer();
