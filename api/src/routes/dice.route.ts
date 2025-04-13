import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import * as diceService from "../services/dice.ts";
import { diceRollQuerySchema } from "../core/validation-schemas.ts";
import { ApiError } from "../core/errors.ts";

export default async function diceRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/roll",
        async (request: FastifyRequest, reply: FastifyReply) => {
            const parseResult = diceRollQuerySchema.safeParse(request.query);
            if (!parseResult.success) {
                throw new ApiError(400, parseResult.error.errors[0].message);
            }

            const rolls = parseResult.data.rolls ?? 1; // Default to 1 roll if not provided
            return {
                result: diceService.rollMultiple(rolls, 1, 6),
            };
        },
    );
}
