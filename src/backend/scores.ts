import { deserializeTickLogs } from "../shared/misc";
import { GameState } from "../shared/game";
import * as fs from "node:fs";
import { get_new_game_object } from "./data";
import { CONFIG } from "./config";


interface Score {
    name: string
    time: number
    input_sequence: string
}
// TODO save this with version number for updates with format changes!

// initialize highscores
let highscores: Score[] = [];
if (fs.existsSync(CONFIG.HIGHSCORES_FILE)) {
    highscores = JSON.parse(fs.readFileSync(CONFIG.HIGHSCORES_FILE, "utf8"));
} else {
    highscores = [];
}

export function clear_highscores() {
    console.log("Clearing highscores")
    highscores = [];
    fs.writeFileSync(CONFIG.HIGHSCORES_FILE, JSON.stringify(highscores));
}

/**
 * Add a new highscore. Deduplicates by name, and does not change the leaderboard if
 * the new entry is too bad or no improvement.
 */
function add_score(s: Score) {
    let name_index = highscores.findIndex(o => o.name === s.name);
    if (name_index >= 0) {
        // name exists, update entry
        if (s.time > highscores[name_index]!.time) {
            // skip, no improvement
            // (This should not happen, as the client should check for that!)
            console.log("Received score for existing name that is no improvement");
            return;
        }
        console.log("Adding highscore to existing leaderboard entry")
        highscores[name_index] = s;
    } else {
        // name does not exist, create new
        if (highscores.length == CONFIG.MAX_LEADERBOARD_LENGTH) {
            let worst_time = highscores[highscores.length - 1]!.time;
            if (s.time > worst_time) {
                // Skip, score is too bad for the leaderboard.
                // (This should not happen, as the client should check for that!)
                console.log("Received score that is too bad for the leaderboard")
                return;
            }
        }
        console.log("Adding highscore to new leaderboard entry");
        highscores.push(s);
    }

    // sort highscores by time
    highscores.sort((a, b) => a.time - b.time);

    // keep only the top N scores
    highscores = highscores.slice(0, CONFIG.MAX_LEADERBOARD_LENGTH);

    // save highscores to file
    fs.writeFileSync(CONFIG.HIGHSCORES_FILE, JSON.stringify(highscores, null, 2));
}

export function get_highscores() {
    return {
        max_length: CONFIG.MAX_LEADERBOARD_LENGTH,
        highscores: highscores
    }
}

/**
 * @param name name of the player
 * @param input_sequence input sequence of the player
 * @returns error msg or null if successful
 */
export function handle_request(name: string, input_sequence: string) {
    const ticklogs = deserializeTickLogs(input_sequence);
    if (ticklogs === null) {
        return "bad ticklogs";
    }

    let game = get_new_game_object()
    for (let ticklog of ticklogs) {
        game.tick(ticklog.dt, ticklog.thrust, ticklog.left, ticklog.right);
        if (game.state == GameState.GAMEOVER) {
            return "gameover";
        }
        if (game.state == GameState.WON) {
            add_score({ name, time: game.t, input_sequence: input_sequence });
            return null;
        }
    }
    return "game still running";
}