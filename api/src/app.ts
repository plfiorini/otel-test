import fastify from "fastify";
import healthRoutes from "./routes/health.route.js";
import externalRoutes from "./routes/external.route.ts";
import stateRoutes from "./routes/state.route.js";
import diceRoutes from "./routes/dice.route.ts";
import { errorHandler } from "./core/errors.ts";
import metricsRoute from "./routes/metrics.route.ts";

export async function buildApp() {
	const app = fastify({
		logger: false,
	});

	// Register routes
	await app.register(metricsRoute);
	await app.register(healthRoutes);
	await app.register(stateRoutes);
	await app.register(externalRoutes, { prefix: "/external" });
	await app.register(diceRoutes, { prefix: "/dice" });

	// Global error handler
	app.setErrorHandler(errorHandler);

	return app;
}

export async function startServer() {
	const app = await buildApp();
	try {
		app.log.info("Starting server...");
		const port = Number(process.env.PORT) || 3000;
		await app.listen({ port, host: "0.0.0.0" });
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
}
