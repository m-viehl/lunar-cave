import { Point, Screen, ShipState } from "../misc";
import * as angle_tools from "./angle_tools";


enum ShipPosition {
    before,
    after,
    inside,
    wall
}

function random_range(min: number, max: number, int = false) {
    let r = min + Math.random() * (max - min);
    if (int)
        return Math.trunc(r)
    return r
}

class Segment {
    center: Point; // center of the corresponding circle
    radius: number;
    centroid: Point; // point in the middle of the segment
    start_angle: number;
    end_angle: number;
    rotation_ccw: boolean;
    arc_length: number;
    enclosed_angle: number;
    previous_arc_length: number; // sum of arc length of all previous segments

    inner_edge: Edge;
    outer_edge: Edge;

    next: Segment | null = null;
    prev: Segment | null = null;

    constructor(center: Point, radius: number, start_angle: number, end_angle: number, ccw: boolean,
        start_inner_r: number, start_outer_r: number, end_inner_r: number, end_outer_r: number, previous?: Segment) {
        this.start_angle = angle_tools.normalize(start_angle);
        this.end_angle = angle_tools.normalize(end_angle);
        this.center = center;
        this.radius = radius;
        this.enclosed_angle = angle_tools.angle_between(this.start_angle, this.end_angle);
        this.arc_length = radius * this.enclosed_angle;
        this.rotation_ccw = ccw;
        this.inner_edge = new Edge(start_inner_r, end_inner_r, this);
        this.outer_edge = new Edge(start_outer_r, end_outer_r, this);
        this.centroid = {
            x: (this.inner_edge.start.x + this.inner_edge.end.x + this.outer_edge.start.x + this.outer_edge.end.x) / 4,
            y: (this.inner_edge.start.y + this.inner_edge.end.y + this.outer_edge.start.y + this.outer_edge.end.y) / 4,
        }
        if (previous !== undefined) {
            previous.next = this;
            this.prev = previous;
            this.previous_arc_length = previous.previous_arc_length + previous.arc_length;
        } else {
            this.previous_arc_length = 0;
        }
    }

    public get_point_position(p: angle_tools.Polar): ShipPosition {
        let pos = angle_tools.get_angle_position(p.phi, this.start_angle, this.end_angle, this.rotation_ccw);
        switch (pos) {
            case angle_tools.AnglePosition.inside:
                let inner_r = this.inner_edge.r(p.phi);
                let outer_r = this.outer_edge.r(p.phi);
                if (inner_r <= p.r && p.r <= outer_r) {
                    return ShipPosition.inside;
                } else {
                    return ShipPosition.wall;
                }
            case angle_tools.AnglePosition.opposite:
                throw new Error("oops");
            case angle_tools.AnglePosition.after:
                return ShipPosition.after;
            case angle_tools.AnglePosition.before:
                return ShipPosition.before;
        }
    }
}

class Edge {
    /**
     * everything called "start" or "end" corresponds to the rotation direction of the Segment passed
     * to the constructor. However, A is always the point "more couter-clockwise" than B.
     * This is (is it really?) required for some angle calculations, see the notes PDF about the geometry. (TODO!)
     */

    r_A: number;
    r_B: number;
    r_start: number;
    r_end: number;
    phi_A: number;
    phi_B: number;

    gamma: number;
    length: number;

    start: Point;
    end: Point;

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

interface Line {
    start: Point,
    end: Point
}

export class Cave {
    segments: Segment[] = [];
    current_segment: Segment;
    spawn: Point;
    end_line: Line;
    help_lines = false;

    // progress calculation
    progress = 0;
    total_arc_length: number;
    spawn_arc_length: number;
    current_arc_length: number;

    // settings
    spawn_segment_index = 5;
    min_angle_per_center = angle_tools.deg2rad(30);
    max_angle_per_center = angle_tools.deg2rad(120);
    // the following ones are multiplied by scale.
    min_segment_arc_length = .5;
    max_segment_arc_length = 5;
    min_cave_diameter = 2.5;
    max_cave_diameter = 20;
    min_radius = 10;
    max_radius = 40;
    end_line_width = 0.3;
    // additional hardcoded settings are marked with the comment // SETTING

    private get_random_inner_outer_radius(current_radius: number): [number, number] {
        return [
            current_radius - random_range(this.min_cave_diameter / 2, this.max_cave_diameter / 2),
            current_radius + random_range(this.min_cave_diameter / 2, this.max_cave_diameter / 2)
        ]
    }

    private next_segment(radius: number, center: Point, ccw: boolean, prev: Segment | null) {
        let start_inner_r: number;
        let start_outer_r: number;
        let start_angle: number;
        if (prev === null) {
            // standard settings if prev is null
            [start_inner_r, start_outer_r] = this.get_random_inner_outer_radius(radius);
            // SETTING
            // start to the right
            start_angle = ccw ? 3 * Math.PI / 2 : Math.PI / 2;
        } else {
            // if prev exists, use its settings
            if (prev.radius !== radius) {
                // radius changed!
                let delta_r_outer: number;
                let delta_r_inner: number;
                if (prev.rotation_ccw !== ccw) {
                    // direction changed, flip outer and inner
                    delta_r_outer = prev.radius - prev.inner_edge.r_end;
                    delta_r_inner = prev.outer_edge.r_end - prev.radius;
                } else {
                    // direction didn't change, don't flip
                    delta_r_outer = prev.outer_edge.r_end - prev.radius;
                    delta_r_inner = prev.radius - prev.inner_edge.r_end;
                }
                start_inner_r = radius - delta_r_inner;
                start_outer_r = radius + delta_r_outer;
            } else {
                // both radius and direction didn't change
                start_inner_r = prev.inner_edge.r_end;
                start_outer_r = prev.outer_edge.r_end;
            }
            if (prev.rotation_ccw !== ccw) {
                // rotation direction changed! Flip start angle by 180°
                start_angle = angle_tools.normalize(prev.end_angle + Math.PI);
            } else {
                start_angle = prev.end_angle;
            }
        }
        // determine new segment's angle via arc length.
        let arc_length = random_range(this.min_segment_arc_length, this.max_segment_arc_length);
        let angle_delta = arc_length / radius * (ccw ? +1 : -1);

        let [end_inner_r, end_outer_r] = this.get_random_inner_outer_radius(radius);

        return new Segment(center, radius, start_angle, start_angle + angle_delta, ccw,
            start_inner_r, start_outer_r, end_inner_r, end_outer_r, prev === null ? undefined : prev);
    }

    constructor(arc_length: number, scale: number) {
        this.min_segment_arc_length *= scale;
        this.max_segment_arc_length *= scale;
        this.min_cave_diameter *= scale;
        this.max_cave_diameter *= scale;
        this.min_radius *= scale;
        this.max_radius *= scale;
        this.end_line_width *= scale;

        // construct segments
        // SETTING: here are the starting segment settings
        let current_radius = random_range(this.min_radius, this.max_radius);
        let current_center = { x: 0, y: 0 };
        let currently_ccw = Math.random() > 0.5;

        let total_arc_length = 0;
        let enclosed_angle_of_current_center = 0;
        let target_enclosed_angle_of_current_center = random_range(this.min_angle_per_center, this.max_angle_per_center);

        while (total_arc_length < arc_length) {
            // append new segment
            let last: Segment | null = null;
            if (this.segments.length > 0)
                last = this.segments[this.segments.length - 1];
            if (last !== null) {
                // determine whether to switch the current center.
                let may_go_backwards = false;
                {
                    let max_segment_angle = this.max_segment_arc_length / current_radius;
                    let worst: number;
                    if (last.rotation_ccw) {
                        let direction = angle_tools.normalize(last.end_angle + Math.PI / 2);
                        worst = angle_tools.normalize(direction + max_segment_angle);
                    } else {
                        let direction = angle_tools.normalize(last.end_angle - Math.PI / 2);
                        worst = angle_tools.normalize(direction + max_segment_angle);
                    }
                    if (!angle_tools.in_angle_range(3 / 2 * Math.PI, Math.PI / 2, worst))
                        may_go_backwards = true;
                }
                let switch_center = enclosed_angle_of_current_center > target_enclosed_angle_of_current_center || may_go_backwards;
                let switch_direction = may_go_backwards || Math.random() > .5; // only make it random if we don't have to.
                if (switch_center) {
                    if (switch_direction)
                        enclosed_angle_of_current_center = 0;
                    target_enclosed_angle_of_current_center = random_range(this.min_angle_per_center, this.max_angle_per_center);
                    // move center.
                    let junction_point = {
                        x: last.center.x + Math.cos(last.end_angle) * last.radius,
                        y: last.center.y + Math.sin(last.end_angle) * last.radius
                    }
                    let v = { // union vector from junction point to last.center
                        x: (last.center.x - junction_point.x) / last.radius,
                        y: (last.center.y - junction_point.y) / last.radius
                    }
                    let new_radius = random_range(this.min_radius, this.max_radius);
                    // scale vector
                    v.x *= new_radius * (switch_direction ? -1 : 1);
                    v.y *= new_radius * (switch_direction ? -1 : 1);

                    current_center = {
                        x: junction_point.x + v.x,
                        y: junction_point.y + v.y
                    };
                    current_radius = new_radius;
                    currently_ccw = switch_direction ? !currently_ccw : currently_ccw;
                }
            }
            let new_segment = this.next_segment(current_radius, current_center, currently_ccw, last);
            this.segments.push(new_segment);
            enclosed_angle_of_current_center += new_segment.enclosed_angle;
            total_arc_length += new_segment.arc_length;
        }
        this.end_line = {
            start: this.segments[this.segments.length - 1].inner_edge.end,
            end: this.segments[this.segments.length - 1].outer_edge.end
        };

        {
            let last = this.segments[this.segments.length - 1]
            this.total_arc_length = last.previous_arc_length + last.arc_length;
        }
        this.spawn_segment_index = Math.min(this.spawn_segment_index, this.segments.length);
        this.spawn = this.segments[this.spawn_segment_index].centroid;
        this.reset();
    }

    public reset() {
        this.current_segment = this.segments[this.spawn_segment_index];
        this.check_collision(this.spawn);
    }

    public check_collision(p: Point, update_current_segment = false): ShipState {
        // performs a collision check and updates current_segment
        // call regularly with current ship position
        let curr = this.current_segment;
        let polar = angle_tools.to_polar(p, curr.center);
        // progress calculation
        this.current_arc_length = curr.previous_arc_length
            + curr.arc_length * angle_tools.angle_between(polar.phi, curr.start_angle) / curr.enclosed_angle;
        if (p === this.spawn) {
            // set spawn arc length
            this.spawn_arc_length = this.current_arc_length;
        }
        this.progress = (this.current_arc_length - this.spawn_arc_length) / (this.total_arc_length - this.spawn_arc_length);

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

    public draw(context: CanvasRenderingContext2D, scr: Screen, style: "fill" | "stroke") {
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
        if (style == "fill")
            context.fill();
        else
            context.stroke();
        // draw help lines
        if (this.help_lines) {
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
        context.lineWidth = this.end_line_width;
        context.beginPath();
        context.moveTo(this.end_line.start.x, this.end_line.start.y);
        context.lineTo(this.end_line.end.x, this.end_line.end.y);
        context.stroke();
    }
}