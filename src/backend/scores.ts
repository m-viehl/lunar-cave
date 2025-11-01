import { deserializeTickLogs } from "../shared/misc";
import { Game, GameState } from "../shared/game";
import * as fs from "fs";
import { get_new_game_object } from "./config";

const MAX_LEADERBOARD_LENGTH = 10;

interface Score {
    name: string
    time: number
}

// initialize highscores
let HIGHSCORES_FILE = "/data/highscores.json";
let highscores: Score[] = [];
if (fs.existsSync(HIGHSCORES_FILE)) {
    highscores = JSON.parse(fs.readFileSync(HIGHSCORES_FILE, "utf8"));
} else {
    highscores = [];
}

export function clear_highscores() {
    console.log("Clearing highscores")
    highscores = [];
    fs.writeFileSync(HIGHSCORES_FILE, JSON.stringify(highscores));
}

function add_score(s: Score) {
    if (highscores.length == MAX_LEADERBOARD_LENGTH) {
        let worst_time = highscores[highscores.length - 1]!.time;
        if (s.time > worst_time) {
            // Skip, score is too bad for the leaderboard. 
            // (This should not happen, as the client should check for that!)
            console.log("Received score that is too bad for the leaderboard")
            return;
        }
    }
    console.log("Adding highscore to leaderboard")

    highscores.push(s)
    
    // sort highscores by time
    highscores.sort((a, b) => b.time - a.time);
    
    // TODO Deduplicate by name?

    // keep only the top MAX_LEADERBOARD_LENGTH scores
    highscores = highscores.slice(0, MAX_LEADERBOARD_LENGTH);
    
    // save highscores to file
    fs.writeFileSync(HIGHSCORES_FILE, JSON.stringify(highscores, null, 2));
}

export function get_highscores(): Score[] {
    return highscores;
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
        game.tick(ticklog.dt, ticklog.left, ticklog.right, ticklog.thrust);
        if (game.state == GameState.GAMEOVER) {
            return "gameover";
        } else if (game.state == GameState.WON) {
            add_score({ name, time: game.t });
            return null;
        }
    }
    return "game still running";
}