import { Cave } from "../shared/cave";
import { type ConfigType, type GameConfig, get_config as get_full_config } from "../shared/config";
import { Game } from "../shared/game";
import * as fs from "node:fs";
import { generate_cave } from "../shared/legacy_generator/generator";
import { convert_cave } from "../shared/legacy_generator/converter";
import { CONFIG } from "./config";
import { clear_highscores } from "./scores";

/**
 * Manages weekly rotation of the current challenge seed as well as the current cave configuration.
 */

let __seed_internal: number = -1;

let game_config_cache: GameConfig | null = null;
let full_config_cache: ConfigType | null = null;
let cave_cache: Cave | null = null;

function get_seed_from_file(): number | null {
  // parse seed from SEED_FILE (contains just the integer), otherwise set to Date.now()
  if (fs.existsSync(CONFIG.SEED_FILE)) {
    const seedContent = fs.readFileSync(CONFIG.SEED_FILE, "utf8").trim();
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


function persist_seed() {
  console.log("Writing seed to file")
  fs.writeFileSync(CONFIG.SEED_FILE, __seed_internal.toString(), "utf8");
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
      persist_seed();
    }
  }

  if (__seed_internal + CONFIG.SEED_VALID_FOR_ms < Date.now()) {
    // seed expired, update
    console.log("Seed is expired, updating")
    __seed_internal = __seed_internal + CONFIG.SEED_VALID_FOR_ms;
    persist_seed();

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
  console.log("Generating config/cave cache");

  let seed = get_seed();

  game_config_cache = CONFIG.GET_GAME_CONFIG(seed);
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
    expires_at: get_seed() + CONFIG.SEED_VALID_FOR_ms,
    game_config: game_config_cache!
  }
}

// try loading seed from file when starting
get_seed();