import type { ConfigType } from "../../shared/config";
import { deserializeTickLogs, type Point, type TickLog } from "../../shared/misc";
import { Ship } from "../../shared/ship";

export class ShipShadow {
    ship: Ship
    tickLogs: TickLog[]

    next_tick_index = 0 // the index of the next ticklog to be processed
    current_t_s = 0 // the t of the internal ship

    constructor(input_sequence: string, spawn_location: Point, config: ConfigType) {
        this.ship = new Ship(spawn_location, config);
        this.tickLogs = deserializeTickLogs(input_sequence)!; // assert not null...
    }

    /**
     * update this shadow's ship to the current game time t
     * @param t current time, in seconds
     */
    public update(t_game_s: number) {
        while (this.tick(t_game_s));
    }

    /**
     * Performs a single tick of the shadow ship if its internal time still lacks behind.
     * Returns whether another re-run is required, i.e. whether *not* up to date yet.
     */
    tick(t_game_s: number): boolean {
        if (this.next_tick_index >= this.tickLogs.length) {
            return false;
        }

        // the time when the next tick of the shadow ship happens
        let next_tick_t_s = this.current_t_s + this.tickLogs[this.next_tick_index]!.dt_s;

        if (t_game_s >= next_tick_t_s) {
            let ticklog = this.tickLogs[this.next_tick_index]!;
            this.next_tick_index++;
            this.current_t_s += ticklog.dt_s;

            this.ship.tick(ticklog.dt_s, ticklog.thrust, ticklog.left, ticklog.right);
            return true;
        } else {
            return false;
        }
    }

    public reset() {
        this.next_tick_index = 0;
        this.current_t_s = 0;
        this.ship.reset();
    }
}