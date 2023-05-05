import Config from "../config/config_type";
import { Point, Screen, ShipState, Line, ShipPosition } from "../misc";
import * as angle_tools from "./angle_tools";
import { Segment } from "./segment";
import { generate_cave as generate_cave_segments } from "./generator";
import { Style } from "../config/style_manager";

export class Cave {
    readonly segments: Segment[] = [];
    private current_segment: Segment;
    readonly spawn: Segment;
    readonly end_line: Line;
    // help_lines = false;

    // progress calculation
    private _progress = 0;
    private readonly total_arc_length: number;
    private spawn_arc_length: number;
    private current_arc_length: number;

    constructor(arc_length: number, config: Config, seed: number) {
        this.segments = generate_cave_segments(arc_length, config, seed);

        this.end_line = {
            start: this.segments[this.segments.length - 1].inner_edge.end,
            end: this.segments[this.segments.length - 1].outer_edge.end
        };

        {
            let last = this.segments[this.segments.length - 1]
            this.total_arc_length = last.previous_arc_length + last.arc_length;
        }
        let spawn_segment_index = Math.min(config.cave.generator.spawn_segment_index, this.segments.length);
        this.spawn = this.segments[spawn_segment_index];
        this.reset();
    }

    public get progress() {
        return this._progress;
    }

    public reset() {
        this.current_segment = this.spawn;
        this.check_collision(this.spawn.centroid);
    }

    public check_collision(p: Point, update_current_segment = false): ShipState {
        // performs a collision check and updates current_segment
        // call regularly with current ship position
        let curr = this.current_segment;
        let polar = angle_tools.to_polar(p, curr.center);
        // progress calculation
        this.current_arc_length = curr.previous_arc_length
            + curr.arc_length * angle_tools.angle_between(polar.phi, curr.start_angle) / curr.enclosed_angle;
        if (p === this.spawn.centroid) {
            // set spawn arc length: setting this in the first reset() call (and before the first usage).
            // We have the value here and it would be superfluous to calculate it in the constructor.
            this.spawn_arc_length = this.current_arc_length;
        }
        this._progress = (this.current_arc_length - this.spawn_arc_length) / (this.total_arc_length - this.spawn_arc_length);

        switch (curr.get_point_position(polar)) {
            case ShipPosition.wall:
                return ShipState.wall;
            case ShipPosition.after:
                while (curr.next !== null) {
                    if (update_current_segment) {
                        this.current_segment = curr.next;
                        return ShipState.alive;
                    } else {
                        curr = curr.next;
                        let pos_next = curr.get_point_position(angle_tools.to_polar(p, curr.center));
                        switch (pos_next) {
                            case ShipPosition.inside:
                                return ShipState.alive;
                            case ShipPosition.wall:
                                return ShipState.wall;
                            case ShipPosition.before:
                                throw new Error("oops");
                        }
                        // it's "after", so continue with next segment
                    }
                }
                return ShipState.end;
            case ShipPosition.inside:
                return ShipState.alive;
            case ShipPosition.before:
                while (curr.prev !== null) {
                    if (update_current_segment) {
                        this.current_segment = curr.prev;
                        return ShipState.alive;
                    } else {
                        curr = curr.prev;
                        let pos_next = curr.get_point_position(angle_tools.to_polar(p, curr.center));
                        switch (pos_next) {
                            case ShipPosition.inside:
                                return ShipState.alive;
                            case ShipPosition.wall:
                                return ShipState.wall;
                            case ShipPosition.after:
                                throw new Error("oops");
                        }
                        // it's "before", so continue with previous segment
                    }
                }
                return ShipState.wall; // start is wall.
            default:
                throw new Error("oops");
        }
    }

    private line_on_screen(l: Line, s: Screen) {
        return (
            l.start.x > s.upper_left.x &&
            l.start.x < s.lower_right.x &&
            l.start.y > s.upper_left.y &&
            l.start.y < s.lower_right.y
        ) || (
                l.end.x > s.upper_left.x && // auto-format is ugly here
                l.end.x < s.lower_right.x &&
                l.end.y > s.upper_left.y &&
                l.end.y < s.lower_right.y
            );
    }

    private segment_on_screen(seg: Segment, scr: Screen) {
        return this.line_on_screen(seg.outer_edge, scr) ||
            this.line_on_screen(seg.inner_edge, scr);
    }

    public draw(context: CanvasRenderingContext2D, scr: Screen, style: Style, draw_help_lines: boolean) {
        // get segments on screen
        let segments: Segment[] = [this.current_segment];
        {
            let current: Segment;
            let off_screen_count = 0;
            // traverse forwards
            current = this.current_segment;
            while (current.next !== null) {
                current = current.next;
                segments.push(current);
                if (!this.segment_on_screen(current, scr)) {
                    // we go up to n segments off-screen to avoid weird artifacts
                    if (++off_screen_count > 4)
                        break;
                }
            }
            // traverse backwards
            current = this.current_segment;
            off_screen_count = 0;
            while (current.prev !== null) {
                current = current.prev;
                segments.unshift(current); // add at beginning
                if (!this.segment_on_screen(current, scr)) {
                    // we go up to n segments off-screen to avoid weird artifacts
                    if (++off_screen_count > 4)
                        break;
                }
            }
        }
        // draw a polygon from segments.
        context.beginPath();
        let curr = segments[0];
        let e = curr.rotation_ccw ? curr.inner_edge : curr.outer_edge;
        context.moveTo(e.start.x, e.start.y);
        // forwards
        for (let i = 0; i < segments.length; i++) {
            curr = segments[i];
            e = curr.rotation_ccw ? curr.inner_edge : curr.outer_edge;
            context.lineTo(e.end.x, e.end.y);
        }
        // now backwards
        curr = segments[segments.length - 1];
        e = curr.rotation_ccw ? curr.outer_edge : curr.inner_edge;
        context.lineTo(e.end.x, e.end.y);
        for (let i = segments.length - 1; i >= 0; i--) {
            curr = segments[i];
            e = curr.rotation_ccw ? curr.outer_edge : curr.inner_edge;
            context.lineTo(e.start.x, e.start.y);
        }
        context.closePath();
        context.fill();
        context.stroke();
        // draw help lines
        if (draw_help_lines) {
            for (let s of segments) {
                context.strokeStyle = "#888888";
                context.lineWidth = 1;
                context.beginPath();
                context.moveTo(s.center.x, s.center.y);
                context.arc(s.center.x, s.center.y, s.radius, s.start_angle, s.end_angle, !s.rotation_ccw);
                context.stroke();
                context.beginPath();
                context.moveTo(s.inner_edge.start.x, s.inner_edge.start.y);
                context.lineTo(s.inner_edge.end.x, s.inner_edge.end.y);
                context.stroke();
                context.beginPath();
                context.moveTo(s.outer_edge.start.x, s.outer_edge.start.y);
                context.lineTo(s.outer_edge.end.x, s.outer_edge.end.y);
                context.stroke();
                context.beginPath();
                context.moveTo(s.inner_edge.start.x, s.inner_edge.start.y);
                context.lineTo(s.outer_edge.start.x, s.outer_edge.start.y);
                context.stroke();
            }
        }
        // draw finish line
        context.strokeStyle = "#009955";
        context.lineWidth = style.cave.end_line_width;
        context.beginPath();
        context.moveTo(this.end_line.start.x, this.end_line.start.y);
        context.lineTo(this.end_line.end.x, this.end_line.end.y);
        context.stroke();
    }
}