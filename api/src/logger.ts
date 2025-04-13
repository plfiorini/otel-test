import { pino } from "pino";

const logger = pino({
	name: "api",
	level: process.env.LOG_LEVEL || "debug",
	transport: {
		targets: [
			{
				target: "pino-opentelemetry-transport",
				options: {
					// ...specific options for OpenTelemetry transport...
				}
			},
			{
				target: "pino-pretty",
				options: {
					colorize: true
				}
			}
		]
	}
});

export default logger;
