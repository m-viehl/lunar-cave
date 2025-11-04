import Fastify from "fastify";
import { get_highscores, handle_request } from "./scores";
import { get_game_config } from "./data";
import { CONFIG } from "./config";


const fastify = Fastify({ logger: false });

// GET /api/current-challenge
fastify.get("/api/current-challenge", async (request, reply) => {
    return get_game_config();
});

// GET /api/highscores
fastify.get("/api/highscores", async (request, reply) => {
    return get_highscores();
});

// POST /api/new-score
fastify.post(
    "/api/new-score",
    {
        schema: {
            body: {
                type: 'object',
                required: ['name', 'input_sequence'],
                additionalProperties: false,
                properties: {
                    name: { type: 'string', pattern: '^[0-9a-zA-Z]{2,20}$' },
                    input_sequence: { type: 'string' }
                }
            }
        }
    },
    async (request, reply) => {
        const { name, input_sequence } = request.body as {
            name: string;
            input_sequence: string;
        };

        const nameRegex = /^[0-9a-zA-Z]{2,20}$/;
        if (!nameRegex.test(name)) {
            reply.code(400);
            return { status: "bad name" };
        }

        const err_msg = handle_request(name, input_sequence);
        if (err_msg) {
            console.log(`invalid highscore request: ${err_msg}`)
            reply.code(400);
            return { status: err_msg };
        } else {
            reply.code(200);
            return { status: "ok" };
        }
    });

fastify.listen({ port: CONFIG.PORT }, (err, address) => {
    if (err) throw err;
    console.log(`Fastify API on ${address}`);
});