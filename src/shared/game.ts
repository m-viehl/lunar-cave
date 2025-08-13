

import { Cave, PointState } from "./cave";
import { ConfigType } from "./config";
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
 * ╾──init───ingame─┬─gameover
 *                  └─won
 * 
 */
export class Game {
    state: GameState = GameState.INGAME
    cave: Cave
    ship: Ship
    t: number = 0

    constructor(cave: Cave, config: ConfigType) {
        // TODO somehow pass game settings, which are also relevant
        this.cave = cave
        this.cave.reset() // if cave is reused.
        this.ship = new Ship(this.cave.spawn_location, config)
    }

    /**
     * Update the game state by a discrete time step
     * 
     * @param dt time step length
     * @param thrust whether thrust input is active
     * @param turn_left whether turn left input is active
     * @param turn_right whether turn right input is active
     */
    public tick(dt: number, thrust: boolean, turn_left: boolean, turn_right: boolean) {
        // 1. update ship
        this.ship.tick(dt, thrust, turn_left, turn_right)

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
        this.t += dt
    }

    public reset() {
        this.ship.reset()
        this.cave.reset()
    }

}