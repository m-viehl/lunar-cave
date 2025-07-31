import { Game, GameState } from "../shared/game";
import { generate_cave } from "../shared/legacy_generator/generator"
import { convert_cave } from "../shared/legacy_generator/converter"

import { key_state, key_listeners } from "./keyboard_io";
import { get_legacy_config } from "../shared/legacy_generator/config";

interface GameConfig {
    time_factor: number
    scale_factor: number
    length: number
    seed: number
} // TODO use this when initializing a game


/**
 * Class that coordinates all objects/data required for a game running in the frontend.
 */
class FrontendGame {
    config: GameConfig
    tick: Tick
    game: Game

    constructor(config: GameConfig) {
        this.config = config

        let cave = convert_cave(
            generate_cave(
                get_legacy_config(
                    config.length,
                    config.seed,
                    config.scale_factor
                )
            )
        )
        this.game = new Game(cave) // TODO make this an inheriting RecordingGame that auto-records inputs?

        this.tick = new Tick((dt) => this.tick_fct(dt))
        key_listeners.any_control_key = () => this.tick.start()
    }

    private tick_fct(dt: number) {
        this.game.tick(dt, key_state.up, key_state.left, key_state.right)
        // TODO render game
        if (this.game.state == GameState.GAMEOVER) {
            this.tick.stop()
            // TODO handle this case, show message, add shadow, ...
        } else if (this.game.state == GameState.WON) {
            this.tick.stop()
            // TODO handle case: show message, highscore upload etc.
        }
        // else: still ingame, do nothing
    }
}
