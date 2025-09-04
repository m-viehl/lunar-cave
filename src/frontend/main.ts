import { Game, GameState } from "../shared/game";
import { generate_cave } from "../shared/legacy_generator/generator"
import { convert_cave } from "../shared/legacy_generator/converter"

import { key_state } from "./keyboard_io";
import { ConfigType, GameConfig, get_config } from "../shared/config";
import { draw_main, screen_size_changed } from "./rendering";
import * as tick from "./tick"
import { MenuComponent } from './menu-component';

import "./menu-component"
import "./select-button"

// we need these import so that the components are actually registered, otherwise, parcel
// will remove it as "unused" when tree-shaking (because it is only used as type here!).
// We need it for the HTML though.

let menuComponent = document.getElementById('menu') as MenuComponent;

/**
 * Class that coordinates all objects/data required for a game running in the frontend.
 */
export class FrontendGame {
    // TODO record crashes and draw shadows of broken ships :D Retry-Hommage!
    // (für weekly challenge: in localstorage für ALLE Versuche speichern :D)

    game: Game
    config: ConfigType

    speed_smoothed = 0

    constructor(game_config: GameConfig) {
        this.config = get_config(game_config)

        let cave = convert_cave(
            generate_cave(this.config),
            this.config,
        )

        this.game = new Game(cave, this.config)
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
        if (this.game.state == GameState.INGAME) {
            this.game.tick(dt, key_state.up, key_state.left, key_state.right)
            draw_main(this)
            menuComponent.state = 'ingame';
        } else if (this.game.state == GameState.GAMEOVER) {
            tick.stop()
            // TODO add shadow, ...
            menuComponent.state = 'lost';
        } else if (this.game.state == GameState.WON) {
            tick.stop()
            // TODO highscore upload etc.
            menuComponent.state = 'won';
        }
    }
}

let current_game: FrontendGame | null = null

function screen_size_callback() {
    if (current_game) {
        screen_size_changed()
        draw_main(current_game)
    }
}

window.addEventListener("resize", screen_size_callback)

///////////////////////////////////////////
// FUNCTIONS CALLED BY menuComponent
///////////////////////////////////////////

export function new_game(config: GameConfig) {
    current_game = new FrontendGame(config)
    screen_size_callback() // initial resize & draw
}

export function start() {
    if (current_game)
        current_game.start()
}

export function reset() {
    if (current_game)
        current_game.reset()
}

/////////////////////////////
/////////////////////////////
