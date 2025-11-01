

import { Cave, PointState } from "./cave";
import { type ConfigType } from "./config";
import { Ship } from "./ship";

export enum GameState {
    INGAME, GAMEOVER, WON
}

/**
 * Manages the state of one game, i.e. holds ship & cave objects and coordinates logic calls between them.
 * Has a state with the following flow graph:
 * 
 * Represents *one single* game run with a specific map seed.
 * Has the following state flow graph:
 * ```
 * ╾──ingame─┬─gameover
 *           └─won
 * ```
 */
export class Game {
    state: GameState = GameState.INGAME
    cave: Cave
    ship: Ship
    t: number = 0

    constructor(cave: Cave, config: ConfigType) {
        this.cave = cave
        this.ship = new Ship(this.cave.spawn_location, config)
        this.reset()
    }

    /**
     * Update the game state by a discrete time step
     * 
     * @param dt_s time step length in seconds
     * @param thrust whether thrust input is active
     * @param turn_left whether turn left input is active
     * @param turn_right whether turn right input is active
     */
    public tick(dt_s: number, thrust: boolean, turn_left: boolean, turn_right: boolean) {
        // 1. update ship
        this.ship.tick(dt_s, thrust, turn_left, turn_right)

        // 2. collision check (which also updates the cave's current_segment state)
        for (let p of this.ship.collision_points) {
            let state = this.cave.get_point_state(p);
            if (state == PointState.CRASH) {
                this.state = GameState.GAMEOVER
                break
            } else if (state == PointState.FINISH) {
                this.state = GameState.WON
                break
            }
            // else, still inside, all fine
        }

        // 3. update time counter
        this.t += dt_s
    }

    public reset() {
        this.ship.reset()
        this.cave.reset()
        this.state = GameState.INGAME
        this.t = 0
    }

}