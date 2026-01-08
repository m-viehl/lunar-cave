import { Game, GameState } from "../../shared/game";
import { generate_cave } from "../../shared/legacy_generator/generator"
import { convert_cave } from "../../shared/legacy_generator/converter"

import { key_state } from "./keyboard_io";
import { type ConfigType, type GameConfig, get_config } from "../../shared/config";
import { draw_main } from "./rendering";
import * as tick from "./tick"

import { RecordingGame } from "./recording_game";
import { ShipShadow } from "./ship_shadow";


interface CrashShadow {
    x: number
    y: number
    angle: number
}

interface CrashShadowSave {
    seed: number
    shadows: CrashShadow[]
}

const LOCALSTORAGE_CRASH_KEY = "lunarmission_crashes";


/**
 * Class that coordinates all objects/data required for a game running in the frontend.
 * Has a fixed config and hence fixed seed/cave.
 */
export class FrontendGame {
    game: RecordingGame
    config: ConfigType
    shadow: ShipShadow | null = null;

    speed_smoothed = 0

    lost_callback: () => void
    won_callback: () => void

    crash_shadows: CrashShadow[] = [];
    persist_crash_shadows: boolean

    constructor(
        game_config: GameConfig,
        lost_callback: () => void,
        won_callback: () => void,
        persist_crash_shadows: boolean,
        shadow_input_sequence: string | null,
    ) {
        this.config = get_config(game_config)
        this.lost_callback = lost_callback
        this.won_callback = won_callback

        this.persist_crash_shadows = persist_crash_shadows;
        if (persist_crash_shadows) {
            this.load_crash_shadows();
        }

        let cave = convert_cave(
            generate_cave(this.config),
            this.config,
        )

        this.game = new RecordingGame(cave, this.config)

        if (shadow_input_sequence) {
            this.shadow = new ShipShadow(shadow_input_sequence, cave.spawn_location, this.config);
        }

        tick.set_callback((dt) => this.tick_fct(dt))

        this.reset()
    }

    private save_crash_shadows() {
        let save: CrashShadowSave = {
            seed: this.config.legacy_cave_config.seed,
            shadows: this.crash_shadows
        };
        localStorage.setItem(LOCALSTORAGE_CRASH_KEY, JSON.stringify(save));
    }

    /**
     * Ioad crash shadows from local storage, and check the seed of the save data.
     * If the seed does not match, load empty list and clear localstorage.
     */
    private load_crash_shadows() {
        let loaded = localStorage.getItem(LOCALSTORAGE_CRASH_KEY);
        if (loaded) {
            let parsed: CrashShadowSave = JSON.parse(loaded);
            if (parsed.seed == this.config.legacy_cave_config.seed) {
                this.crash_shadows = parsed.shadows;
            } else {
                // wrong seed (cave expired), clear localstorage, keep empty list
                localStorage.removeItem(LOCALSTORAGE_CRASH_KEY);
            }
        }
    }

    public reset() {
        tick.stop()
        this.game.reset()
        if (this.shadow) {
            this.shadow.reset()
        }

        // we start with max speed to achieve a zoom-in effect on game start
        this.speed_smoothed = this.config.zoom_config.max_speed
        draw_main(this)
    }

    public start() {
        tick.start()
    }

    private tick_fct(dt_s: number) {
        dt_s *= this.config.ship_config.time_factor

        {
            // calculate smoothed speed
            let T = this.config.zoom_config.speed_smoothing_factor
            let exp = Math.exp(-dt_s / T);
            this.speed_smoothed = this.game.ship.speed * (1 - exp) + this.speed_smoothed * exp;
        }

        // game tick
        // somehow tell the UI when game ends!
        if (this.game.state == GameState.INGAME) {
            this.game.tick(dt_s, key_state.up, key_state.left, key_state.right)
            draw_main(this)
        } else {
            tick.stop()
            if (this.game.state == GameState.WON) {
                this.won_callback()
            } else {
                // save lost state for shadow
                this.crash_shadows.push({
                    x: this.game.ship.x,
                    y: this.game.ship.y,
                    angle: this.game.ship.angle,
                })
                if (this.persist_crash_shadows) {
                    this.save_crash_shadows();
                }
                this.lost_callback()
            }
        }

        // update shadow

        if (this.shadow) {
            this.shadow.update(this.game.t);
        }
    }
}
