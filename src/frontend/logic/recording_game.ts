import { Game } from "../../shared/game";
import { serializeTickLogs, type TickLog } from "../../shared/misc";

export class RecordingGame extends Game {
    recording: TickLog[] = []

    public tick(dt: number, thrust: boolean, turn_left: boolean, turn_right: boolean) {
        super.tick(dt, thrust, turn_left, turn_right);
        this.recording.push({
            dt: dt,
            left: turn_left,
            right: turn_right,
            thrust: thrust,
        });
    }

    public reset() {
        super.reset();
        this.recording = [];
    }

    public get_recording_string() {
        return serializeTickLogs(this.recording)
    }
}
