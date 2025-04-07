import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import axios from "axios";

type Order = {
    id: string;
    prodotto: string;
    stato: string;
};

type ExternalData = {
    userId: number;
    id: number;
    title: string;
    body: string;
};

type OrdersResponse = {
    order: Order;
    external: ExternalData[];
    timestamp: Date;
};

export default async function ordersRoutes(fastify: FastifyInstance) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fastify.get("/external/ok", async (_request: FastifyRequest, _reply: FastifyReply) => {
        const external: ExternalData[] = [];

        const randomNumber = Math.floor(Math.random() * 10) + 1;
        for (let i = 1; i <= randomNumber; i++) {
            const externalData = await axios.get(`https://jsonplaceholder.typicode.com/posts/${i}`).then((externalData) => {
                external.push(externalData.data);
            }).catch((error) => {
                console.error(`Error fetching external data: ${error}`);
                return null;
            });
            if (!externalData) {
                continue;
            }
        }

        return {
            order: {
                id: 'A123',
                prodotto: 'Sensore IoT',
                stato: 'confermato',
            },
            external,
            timestamp: new Date(),
        } as OrdersResponse;
    });

    fastify.get("/external/500", async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            const response = await axios.get('https://httpstat.us/500');
            return response.data;
        } catch (error) {
            console.error(`Error fetching external data: ${error}`);
            const response = {
                error: "External service error",
                timestamp: new Date(),
            };
            reply.status(500).send(response);
        }
    });

    fastify.get("/external/slow", async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            const response = await axios.get('https://httpstat.us/200?sleep=3000', { timeout: 1 });
            return response.data;
        } catch (error) {
            console.error(`External request timed out: ${error}`);
            const response = {
                error: "External service timeout",
                timestamp: new Date(),
            };
            reply.status(500).send(response);
        }
    });
}
