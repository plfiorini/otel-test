import fastify from "fastify";
import healthRoutes from "./routes/health.route.js";
import stateRoutes from "./routes/state.route.js";
import ordersRoutes from "./routes/orders.route.js";

export async function buildApp() {
    const app = fastify({
        logger: true,
    });

    // Register routes
    await app.register(healthRoutes);
    await app.register(stateRoutes);
    await app.register(ordersRoutes);

    return app;
}

export async function startServer() {
    const app = await buildApp();
    try {
        await app.listen({ port: 3000, host: "0.0.0.0" });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}
