import { Game, GameState } from "../shared/game";
import { generate_cave } from "../shared/legacy_generator/generator"
import { convert_cave } from "../shared/legacy_generator/converter"

import { key_state, key_listeners } from "./keyboard_io";
import { ConfigType, GameConfig, get_config } from "../shared/config";
import { draw_main, screen_size_changed } from "./rendering";
import * as tick from "./tick"


/**
 * Class that coordinates all objects/data required for a game running in the frontend.
 */
export class FrontendGame {
    game: Game
    config: ConfigType

    constructor(game_config: GameConfig) {
        this.config = get_config(game_config)

        let cave = convert_cave(
            generate_cave(this.config),
            this.config,
        )

        this.game = new Game(cave, this.config)
        // TODO make this an inheriting RecordingGame that auto-records inputs?

        tick.set_callback((dt) => this.tick_fct(dt))
        key_listeners.any_control_key = () => tick.start()
    }

    private tick_fct(dt: number) {
        if (this.game.state == GameState.INGAME) {
            this.game.tick(dt, key_state.up, key_state.left, key_state.right)
            draw_main(this)
        } else if (this.game.state == GameState.GAMEOVER) {
            tick.stop()
            // TODO handle this case, show message, add shadow, ...
        } else if (this.game.state == GameState.WON) {
            tick.stop()
            // TODO handle case: show message, highscore upload etc.
        }
    }
}

function get_config_from_UI(): GameConfig {
    let time_factor = parseFloat((document.getElementById("physics_speed_select") as HTMLSelectElement).value)
    let scale_factor = parseFloat((document.getElementById("cave_size_select") as HTMLSelectElement).value)
    let length = parseFloat((document.getElementById("cave_length_select") as HTMLSelectElement).value)
    let seed = Date.now();
    const SCALE = 20
    return {
        time_factor: time_factor,
        cave_scale: scale_factor * SCALE,
        ship_scale: SCALE,
        length: length,
        seed: seed,
    }
}


let remove_window_callback: null | (() => void) = null;

function new_game() {
    let config = get_config_from_UI()
    let game = new FrontendGame(config)

    // WINDOW RESIZE LISTENER
    if (remove_window_callback) {
        remove_window_callback()
    }
    let screen_size_callback = () => {
        screen_size_changed()
        draw_main(game)
    }
    window.addEventListener("resize", screen_size_callback)
    // save a closure to remove the handler again later
    remove_window_callback = () => { window.removeEventListener("resize", screen_size_callback) }

    screen_size_callback() // initial resize & draw
    // TODO da war doch was, dass man mehrmals zeichnen muss, bis was ankommt, oder!?
}

// MAIN FUNCTION
function main() {
    document.body.removeChild(document.getElementById("noscript-text")!);
    key_listeners.N = new_game
    new_game()

    // TODO do sth with the game status message field!
}

main();