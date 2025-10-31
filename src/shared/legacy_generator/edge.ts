import { type Point } from "../misc";
import { Segment } from "./segment"
import * as angle_tools from "./angle_tools";


export class Edge {
    /**
     * everything called "start" or "end" corresponds to the rotation direction of the Segment passed
     * to the constructor. However, A is always the point "more couter-clockwise" than B.
     * This is (is it really?) required for some angle calculations, see the notes PDF about the geometry. (TODO!)
     */

    readonly r_A: number;
    readonly r_B: number;
    readonly r_start: number;
    readonly r_end: number;
    readonly phi_A: number;
    readonly phi_B: number;

    readonly gamma: number;
    readonly length: number;

    readonly start: Point;
    readonly end: Point;

    constructor(r_start: number, r_end: number, segment: Segment) {
        // give r_start and r_end without swapping for segment.rotation_ccw!
        this.r_start = r_start;
        this.r_end = r_end;
        if (segment.rotation_ccw) {
            this.r_A = r_end;
            this.r_B = r_start;
            this.phi_A = segment.end_angle;
            this.phi_B = segment.start_angle;
        } else {
            this.r_A = r_start;
            this.r_B = r_end;
            this.phi_A = segment.start_angle;
            this.phi_B = segment.end_angle;
        }

        // calc length
        this.start = {
            x: segment.center.x + Math.cos(segment.start_angle) * r_start,
            y: segment.center.y + Math.sin(segment.start_angle) * r_start
        }
        this.end = {
            x: segment.center.x + Math.cos(segment.end_angle) * r_end,
            y: segment.center.y + Math.sin(segment.end_angle) * r_end
        }
        this.length = Math.hypot(this.start.x - this.end.x, this.start.y - this.end.y);

        let A = segment.rotation_ccw ? this.end : this.start;
        let B = segment.rotation_ccw ? this.start : this.end;

        let ba = { // vector from B to A
            x: A.x - B.x,
            y: A.y - B.y
        }
        let b0 = { // vector from B to center
            x: segment.center.x - B.x,
            y: segment.center.y - B.y
        }
        this.gamma = angle_tools.angle_between_vectors(ba, b0);
    }

    public r(phi: number): number {
        if (!angle_tools.in_angle_range(this.phi_B, this.phi_A, phi))
            throw new Error("phi not in segment!");
        let theta = angle_tools.angle_between(phi, this.phi_B);
        let delta = Math.PI - this.gamma - theta;
        return this.r_B * Math.sin(this.gamma) / Math.sin(delta);
    }
}
