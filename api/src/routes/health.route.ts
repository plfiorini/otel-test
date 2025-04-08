import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import logger from "../logger.js";
import { State } from "../state.js";

export default async function healthRoutes(fastify: FastifyInstance) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	fastify.get(
		"/healthz",
		async (_request: FastifyRequest, _reply: FastifyReply) => {
			const state = State.getInstance();
			const simulateError =
				state.simulateError > 0 && Math.random() < state.simulateError / 100;
			const simulateSlow =
				state.simulateSlow > 0 && Math.random() < state.simulateSlow / 100;

			if (simulateError) {
				logger.warn(`Simulating an error (${state.simulateError}%)`);
				throw new Error("Simulated error");
			}

			if (simulateSlow) {
				logger.warn(`Simulating slow response (${state.simulateSlow}%)`);
				await new Promise((resolve) => setTimeout(resolve, 5000));
			}

			return {
				status: "ok",
				timestamp: new Date(),
			};
		},
	);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	fastify.get(
		"/readyz",
		async (_request: FastifyRequest, _reply: FastifyReply) => {
			return {
				status: "ok",
				timestamp: new Date(),
			};
		},
	);
}
