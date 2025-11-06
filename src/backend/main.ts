import Fastify from "fastify";
import fastifyStatic from '@fastify/static'

import { get_highscores, handle_request } from "./scores";
import { get_game_config } from "./data";
import { CONFIG } from "./config";

import * as fs from "node:fs";
import { resolve } from 'node:path';
import { exit } from "node:process";


const fastify = Fastify({ logger: false });

/////////////////////////////////////////////////////////
// API Routes
/////////////////////////////////////////////////////////


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


/////////////////////////////////////////////////////////
// Serve static files if directory is given
/////////////////////////////////////////////////////////

if (process.env.STATIC_DIR) {
    let static_dir = resolve(process.env.STATIC_DIR);
    if (!fs.existsSync(static_dir) || !fs.statSync(static_dir).isDirectory()) {
        console.error(`Static file directory ${static_dir} is no valid directory!`)
        exit(1);
    } else {
        console.log(`Serving static files from ${static_dir}`)
    }

    fastify.register(fastifyStatic, {
        root: static_dir,
        // By default all assets are immutable and can be cached for a long period due to cache bursting techniques
        maxAge: '30d',
        immutable: true,
    })

    fastify.get('/', function (req, reply) {
        // Caching exception: index.html should never be cached
        reply.sendFile('index.html', { maxAge: 0, immutable: false })
    })
} else {
    console.log("Not serving static files.")
}

/////////////////////////////////////////////////////////
// start server
/////////////////////////////////////////////////////////

fastify.listen(
    { port: CONFIG.PORT, host: '0.0.0.0' },
    (err, address) => {
        if (err) throw err;
        console.log(`Fastify API on ${address}`);
    }
);