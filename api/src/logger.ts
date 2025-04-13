import { pino } from "pino";

const logger = pino({
	name: "api",
	level: process.env.LOG_LEVEL || "debug",
	transport: {
		targets: [
			{
				target: "pino-loki-transport",
				options: {
					lokiUrl: process.env.LOKI_URL,
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
