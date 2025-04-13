import type { FastifyReply, FastifyRequest } from "fastify";

export class ApiError extends Error {
    public statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = "ApiError";
    }
}

export function errorHandler(error: Error, request: FastifyRequest, reply: FastifyReply) {
    if (error instanceof ApiError) {
        // Handle custom API errors
        reply.status(error.statusCode).send({
            error: error.name,
            message: error.message,
        });
    } else {
        // Handle generic errors
        console.error("Internal Server Error:", error);
        reply.status(500).send({
            error: "Internal Server Error",
            message: "An unexpected error occurred.",
        });
    }
}