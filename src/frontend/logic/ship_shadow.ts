import type { ConfigType } from "../../shared/config";
import { deserializeTickLogs, type Point, type TickLog } from "../../shared/misc";
import { Ship } from "../../shared/ship";

export class ShipShadow {
    ship: Ship
    tickLogs: TickLog[]

    next_tick_index = 0 // the index of the next ticklog to be processed
    current_t_ms = 0 // the t of the internal ship

    constructor(input_sequence: string, spawn_location: Point, config: ConfigType) {
        this.ship = new Ship(spawn_location, config);
        this.tickLogs = deserializeTickLogs(input_sequence)!; // assert not null...
    }

    /**
     * update this shadow's ship to the current game time t
     * @param t current time, in seconds
     */
    public update(t_game_s: number) {
        if (this.next_tick_index == this.tickLogs.length) {
            return; // we're at the end of the tickLogs, don't update anymore
        }

        let next_tick_t_ms = this.current_t_ms + this.tickLogs[this.next_tick_index]!.dt;
        if (t_game_s * 1000 >= next_tick_t_ms) {
            let upd = this.tickLogs[this.next_tick_index]!;
            this.next_tick_index++;
            this.current_t_ms += upd.dt;

            this.ship.tick(upd.dt, upd.thrust, upd.left, upd.right);
        }
    }

    public reset() {
        this.next_tick_index = 0;
        this.current_t_ms = 0;
        this.ship.reset();
    }
}