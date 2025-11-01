import { Cave } from "../shared/cave";
import { type ConfigType, type GameConfig, get_config as get_full_config } from "../shared/config";
import { Game } from "../shared/game";
import * as fs from "fs";
import { generate_cave } from "../shared/legacy_generator/generator";
import { convert_cave } from "../shared/legacy_generator/converter";
import { clear_highscores } from "./scores";

/**
 * Manages weekly rotation of the current challenge seed as well as the current cave configuration.
 * 
 * Provides two functions:
 * get_game_config allows clients to fetch 
 */

const SEED_VALID_FOR_ms = 7 * 24 * 60 * 60 * 1000; // (one week)

let SEED_FILE = "/data/seed.txt";
let __seed_internal: number = -1;

let game_config_cache: GameConfig | null = null;
let full_config_cache: ConfigType | null = null;
let cave_cache: Cave | null = null;

function get_seed_from_file(): number | null {
  // parse seed from SEED_FILE (contains just the integer), otherwise set to Date.now()
  if (fs.existsSync(SEED_FILE)) {
    const seedContent = fs.readFileSync(SEED_FILE, "utf8").trim();
    let parsed = parseInt(seedContent);
    if (isNaN(parsed)) {
      console.log("WARNING: Seed file invalid!")
      return null;
    }
    // parsed is valid
    console.log("Restored seed from file")
    return parsed;
  }
  console.log("No persisted seed found")
  return null;
}



function get_seed() {
  if (__seed_internal == -1) {
    // seed uninitialized
    let parsed = get_seed_from_file();
    if (parsed !== null) {
      __seed_internal = parsed;
    } else {
      console.log("Initializing seed to Date.now()")
      __seed_internal = Date.now();
    }
  }

  if (__seed_internal + SEED_VALID_FOR_ms < Date.now()) {
    // seed expired, update
    console.log("Seed is expired, updating")
    __seed_internal = __seed_internal + SEED_VALID_FOR_ms;

    // persist to file
    console.log("Writing seed to file")
    fs.writeFileSync(SEED_FILE, __seed_internal.toString(), "utf8");

    // clear cache
    full_config_cache = null;
    cave_cache = null;
    game_config_cache = null;

    // new seed, clear leaderboard!
    clear_highscores();
  }

  return __seed_internal;
}

/**
 * Creates the cached objects
 */
function ensure_cache_exists() {
  if (game_config_cache && full_config_cache && cave_cache)
    return;

  // generate cache
  let seed = get_seed();

  console.log("Generating config/cave cache")

  const SCALE = 20
  game_config_cache = {
    time_factor: 1,
    cave_scale: 1 * SCALE,
    length: 350,
    seed: seed,
    ship_scale: SCALE,
  }

  full_config_cache = get_full_config(game_config_cache);

  cave_cache = convert_cave(generate_cave(full_config_cache), full_config_cache);
}

/**
 * @returns Returns a new Game object with the current seed/config.
 */
export function get_new_game_object(): Game {
  ensure_cache_exists();
  return new Game(cave_cache!, full_config_cache!);
}

/**
 * @returns Returns object with GameConfig and its expiry timestamp
 */
export function get_game_config() {
  ensure_cache_exists();
  return {
    expires_at: get_seed() + SEED_VALID_FOR_ms,
    game_config: game_config_cache
  }
}