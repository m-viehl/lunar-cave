import Fastify from "fastify";
import { get_highscores, handle_request } from "./scores";
import { get_game_config } from "./config";

const fastify = Fastify({ logger: true });

// GET /current-challenge
fastify.get("/current-challenge", async (request, reply) => {
    return get_game_config();
});

// GET /highscores
fastify.get("/highscores", async (request, reply) => {
    return get_highscores();
});

// POST /new-score
fastify.post("/new-score", async (request, reply) => {
    const { name, input_sequence } = request.body as {
        name: string;
        input_sequence: string;
    };

    const nameRegex = /^[0-9a-zA-Z]{2,30}$/;
    if (!nameRegex.test(name)) {
        reply.code(400);
        return { status: "bad name" };
    }

    const err_msg = handle_request(name, input_sequence);
    if (err_msg) {
        reply.code(400);
        return { status: err_msg };
    } else {
        reply.code(200);
        return { status: "ok" };
    }
});

fastify.listen({ port: 3000 }, (err, address) => {
    if (err) throw err;
    console.log(`Fastify API on ${address}`);
});