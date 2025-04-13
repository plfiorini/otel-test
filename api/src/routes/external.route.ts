import axios from "axios";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

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

export default async function externalRoutes(fastify: FastifyInstance) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	fastify.get(
		"/ok",
		async (_request: FastifyRequest, _reply: FastifyReply) => {
			const external: ExternalData[] = [];

			const randomNumber = Math.floor(Math.random() * 10) + 1;
			for (let i = 1; i <= randomNumber; i++) {
				const externalData = await axios
					.get(`https://jsonplaceholder.typicode.com/posts/${i}`)
					.then((externalData) => {
						external.push(externalData.data);
					})
					.catch((error) => {
						console.error(`Error fetching external data: ${error}`);
						return null;
					});
			}

			return {
				order: {
					id: "A123",
					prodotto: "Sensore IoT",
					stato: "confermato",
				},
				external,
				timestamp: new Date(),
			} as OrdersResponse;
		},
	);

	fastify.get(
		"/500",
		async (_request: FastifyRequest, reply: FastifyReply) => {
			try {
				const response = await axios.get("https://httpstat.us/500");
				return response.data;
			} catch (error) {
				console.error(`Error fetching external data: ${error}`);
				const response = {
					error: "External service error",
					timestamp: new Date(),
				};
				reply.status(500).send(response);
			}
		},
	);

	fastify.get(
		"/slow",
		async (_request: FastifyRequest, reply: FastifyReply) => {
			try {
				const response = await axios.get("https://httpstat.us/200?sleep=3000", {
					timeout: 1,
				});
				return response.data;
			} catch (error) {
				console.error(`External request timed out: ${error}`);
				const response = {
					error: "External service timeout",
					timestamp: new Date(),
				};
				reply.status(500).send(response);
			}
		},
	);
}
