import type { FastifyInstance } from 'fastify';
import client from 'prom-client';

export default async function metricsRoute(fastify: FastifyInstance) {
    // Create a new Prometheus Registry
    const register = new client.Registry();

    // Add default metrics to the registry
    client.collectDefaultMetrics({ register });

    // Define the /metrics route
    fastify.get('/metrics', async (_request, reply) => {
        try {
            const metrics = await register.metrics();
            reply
                .header('Content-Type', register.contentType)
                .send(metrics);
        } catch (err) {
            reply.status(500).send('Error generating metrics');
        }
    });
}
