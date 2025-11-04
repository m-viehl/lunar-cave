import { resolve } from 'node:path';
import * as fs from "node:fs";
import { exit } from 'node:process';
import type { GameConfig } from '../shared/config';


let DATA_DIR = "./data" // default
if (process.env.DATA_DIR) {
    DATA_DIR = process.env.DATA_DIR;
}
console.log(`Using data dir: ${resolve(DATA_DIR)}`)
if (!fs.existsSync(DATA_DIR) || !fs.statSync(DATA_DIR).isDirectory()) {
    console.error("Data dir does not exist or is no directory.")
    exit(1)
}


function get_config(seed: number): GameConfig {
    return {
        time_factor: 1,
        cave_scale: 20,
        length: 70, // TODO DEBUG, eigl 350,
        seed: seed,
        ship_scale: 20,
    }
}


export let CONFIG = {
    HIGHSCORES_FILE: resolve(DATA_DIR, "highscores.json"),
    MAX_LEADERBOARD_LENGTH: 10,
    SEED_VALID_FOR_ms: 7 * 24 * 60 * 60 * 1000, // (one week)
    SEED_FILE: resolve(DATA_DIR, "seed.txt"),
    PORT: 3000,
    GET_GAME_CONFIG: get_config,
}
