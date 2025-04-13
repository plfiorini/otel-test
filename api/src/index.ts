// Start SDK
import { sdk } from "./instrumentation.ts";
sdk.start();

import { Command } from "commander";
import * as pkg from "../package.json" with { type: "json" };
import { startServer } from "./app.ts";

const program = new Command();

program
	.version(pkg.default.version)
	.description("Typical ReST API server")
	.option("--debug", "Enable debug mode")
	.on("--help", () => {
		process.exit(0); // Exit the process after displaying help
	});

program.parse(process.argv);

const options = program.opts();

startServer();
