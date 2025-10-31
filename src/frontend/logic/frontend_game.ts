import { Game, GameState } from "../../shared/game";
import { generate_cave } from "../../shared/legacy_generator/generator"
import { convert_cave } from "../../shared/legacy_generator/converter"

import { key_state } from "./keyboard_io";
import { type ConfigType, type GameConfig, get_config } from "../../shared/config";
import { draw_main } from "./rendering";
import * as tick from "./tick"

import { RecordingGame } from "./recording_game";


/**
 * Class that coordinates all objects/data required for a game running in the frontend.
 */
export class FrontendGame {
    // TODO record crashes and draw shadows of broken ships :D Retry-Hommage!
    // (für weekly challenge: in localstorage für ALLE Versuche speichern :D)

    game: RecordingGame
    config: ConfigType

    speed_smoothed = 0

    lost_callback: () => void
    won_callback: () => void

    constructor(game_config: GameConfig, lost_callback: () => void, won_callback: () => void) {
        this.config = get_config(game_config)
        this.lost_callback = lost_callback
        this.won_callback = won_callback

        let cave = convert_cave(
            generate_cave(this.config),
            this.config,
        )

        this.game = new RecordingGame(cave, this.config)
        // TODO add recording inputs

        tick.set_callback((dt) => this.tick_fct(dt))

        this.reset()
    }

    public reset() {
        this.game.reset()

        // we start with max speed to achieve a zoom-in effect on game start
        this.speed_smoothed = this.config.zoom_config.max_speed
        draw_main(this)
    }

    public start() {
        tick.start()
    }

    private tick_fct(dt: number) {
        dt *= this.config.ship_config.time_factor

        // calculate smoothed speed
        {
            // Normalize v to be frame rate agnostic.
            // Without this, smoothing would be quicker with higher frame rates.
            // We normalize to 60Hz, for which the smoothing factor was tuned during development.
            let v_norm = this.game.ship.speed / dt * 0.0167
            let a = this.config.zoom_config.speed_smoothing_factor
            this.speed_smoothed = v_norm * a + this.speed_smoothed * (1 - a)
        }

        // game tick
        // somehow tell the UI when game ends!
        if (this.game.state == GameState.INGAME) {
            this.game.tick(dt, key_state.up, key_state.left, key_state.right)
            draw_main(this)
        } else {
            tick.stop()
            if (this.game.state == GameState.WON) {
                this.won_callback()
            } else {
                this.lost_callback()
            }
        }
        // TODO dispatch event? such that UI can react
    }
}
