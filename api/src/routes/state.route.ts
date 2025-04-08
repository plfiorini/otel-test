import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { State, type StateType } from "../state.js";

export default async function stateRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/state",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						simulateError: { type: "number", minimum: 0, maximum: 100 },
						simulateSlow: { type: "number", minimum: 0, maximum: 100 },
					},
					required: ["simulateError", "simulateSlow"],
				},
			},
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		},
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { simulateError, simulateSlow } = request.body as StateType;
			const state = State.getInstance();
			state.simulateError = simulateError;
			state.simulateSlow = simulateSlow;

			return {
				message: "State updated successfully",
				simulateError,
				simulateSlow,
			};
		},
	);
}
