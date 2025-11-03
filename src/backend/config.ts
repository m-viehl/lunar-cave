import { resolve } from 'node:path';

let DATA_DIR = "./data" // default
if (process.env.DATA_DIR) {
    DATA_DIR = process.env.DATA_DIR;
}
console.log(`Using data dir: ${resolve(DATA_DIR)}`)


export let CONFIG = {
    HIGHSCORES_FILE: resolve(DATA_DIR, "highscores.json"),
    MAX_LEADERBOARD_LENGTH: 10,
    SEED_VALID_FOR_ms: 7 * 24 * 60 * 60 * 1000, // (one week)
    SEED_FILE: resolve(DATA_DIR, "seed.txt"),
    PORT: 3000,
    GET_GAME_CONFIG: (seed: number) => {
        return {
            time_factor: 1,
            cave_scale: 20,
            length: 350,
            seed: seed,
            ship_scale: 20,
        }
    }
}
