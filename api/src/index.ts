import "./instrumentation.js";

import { Command } from "commander";
import * as pkg from "../package.json" with { type: "json" };
import { startServer } from "./app.js";

const program = new Command();

program
    .version(pkg.default.version)
    .description("Typical ReST API server")
    .option("-c, --config <path>", "Path to the configuration file", "./config/api.yaml")
    .on("--help", () => {
        process.exit(0); // Exit the process after displaying help
    });

program.parse(process.argv);

const options = program.opts();
const configPath = options.config;
if (!configPath) {
    throw new Error("Configuration file path must be provided.");
}

// const config = Config.getInstance(configPath);
// if (!config.tenantUrl || !config.otelToken) {
//     throw new Error("Tenant URL and/or API token must be defined in the configuration file.");
// }

// console.debug(`Starting Persist with configuration file: ${configPath}`);
// console.debug(`Tenant URL: ${config.tenantUrl}`);
// console.debug(`API Token: ${config.otelToken}`);

startServer();
