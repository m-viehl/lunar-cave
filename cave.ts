export type Point = { x: number, y: number };
type Polar = { phi: number, r: number };

type AnglePosition = "front" | "rear" | "inside" | "opposite";
type ShipPosition = "front" | "rear" | "inside" | "wall";
export type ShipState = "alive" | "wall" | "end";

function normalize(alpha: number) {
    return (alpha + 4 * Math.PI) % (2 * Math.PI);
}


function in_angle_range(start: number, end: number, phi: number) {
    // angle range is defined counter-clockwise from start to end (possibly going over zero).
    start = normalize(start);
    end = normalize(end);
    phi = normalize(phi);
    if (start === end)
        return phi === start;
    if (start < end)
        return start <= phi && phi < end;
    // start > end
    return (0 <= phi && phi < end) || (start <= phi && phi < 2 * Math.PI);
}

function angle_between(phi: number, theta: number) {
    // returns the *smaller* angle enclosed between phi and theta.
    phi = normalize(phi);
    theta = normalize(theta);
    if (phi < theta) {
        return Math.min(theta - phi, phi + (2 * Math.PI - theta));
    } else {
        return Math.min(phi - theta, theta + (2 * Math.PI - phi));
    }
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

    inner_edge: Edge;
    outer_edge: Edge;

    next: Segment | null = null;
    prev: Segment | null = null;

    constructor(center: Point, radius: number, start_angle: number, end_angle: number, ccw: boolean,
        start_inner_r: number, start_outer_r: number, end_inner_r: number, end_outer_r: number) {
        this.start_angle = normalize(start_angle);
        this.end_angle = normalize(end_angle);
        this.center = center;
        this.radius = radius;
        this.enclosed_angle = angle_between(this.start_angle, this.end_angle);
        this.arc_length = radius * this.enclosed_angle;
        this.rotation_ccw = ccw;
        this.inner_edge = new Edge(start_inner_r, end_inner_r, this);
        this.outer_edge = new Edge(start_outer_r, end_outer_r, this);
        this.centroid = {
            x: (this.inner_edge.start.x + this.inner_edge.end.x + this.outer_edge.start.x + this.outer_edge.end.x) / 4,
            y: (this.inner_edge.start.y + this.inner_edge.end.y + this.outer_edge.start.y + this.outer_edge.end.y) / 4,
        }
        console.log(`creating Segment. Center: ${center.x}, ${center.y}. radius ${radius}. `)
    }

    public to_polar(p: Point): Polar {
        return {
            phi: Math.atan2(p.y - this.center.y, p.x - this.center.x),
            r: Math.hypot(p.x - this.center.x, p.y - this.center.y)
        };
    }

    private get_angle_position(phi: number): AnglePosition {
        let A: number;
        let B: number;
        let ccw = this.rotation_ccw;
        if (ccw) {
            A = this.start_angle;
            B = this.end_angle;
        } else {
            A = this.end_angle;
            B = this.start_angle;
        }
        if (in_angle_range(A, B, phi)) {
            return "inside";
        }
        if (ccw) {
            if (in_angle_range(B, B + Math.PI / 2, phi))
                return "rear";
            if (in_angle_range(A - Math.PI / 2, A, phi))
                return "front";
            return "opposite"
        } else {
            if (in_angle_range(B, B + Math.PI / 2, phi))
                return "front";
            if (in_angle_range(A - Math.PI / 2, A, phi))
                return "rear";
            return "opposite"
        }
    }

    public get_point_position(p: Polar): ShipPosition {
        let pos = this.get_angle_position(p.phi)
        console.log(pos);
        switch (pos) {
            case "inside":
                let inner_r = this.inner_edge.r(p.phi);
                let outer_r = this.outer_edge.r(p.phi);
                console.log(`inner ${inner_r}, outer ${outer_r}`)
                if (inner_r <= p.r && p.r <= outer_r)
                    return "inside";
                else
                    return "wall";
            case "opposite":
                throw new Error("oops");
            default:
                // typescript is so cool! Only "front" and "rear" remain, which are valid ShipPositions :)
                return pos;
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
    beta: number;
    length: number;

    start: Point;
    end: Point;

    constructor(r_start: number, r_end: number, segment: Segment) {
        // give r_start and r_end without swapping for segment.rotation_ccw!
        this.r_start = r_start;
        this.r_end = r_end;
        this.beta = segment.enclosed_angle;
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
        if (this.beta >= 2 * Math.PI)
            throw new Error("oops");

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

        this.gamma = Math.asin(this.r_A / this.length * Math.sin(this.beta));
    }

    public r(phi: number): number {
        if (!in_angle_range(this.phi_B, this.phi_A, phi))
            throw new Error("phi not in segment!");
        let delta = Math.PI - this.gamma - angle_between(phi, this.phi_B);
        return this.r_B * Math.sin(this.beta) / Math.sin(delta);
    }
}

function deg2rad(deg: number) {
    return deg / 360 * 2 * Math.PI;
}

function random_range(min: number, max: number, int = false) {
    let r = min + Math.random() * (max - min);
    if (int)
        return Math.trunc(r)
    return r
}

export class Cave {
    segments: Segment[] = [];
    current_segment: Segment;
    spawn: Point;

    // settings
    min_angle_per_center = deg2rad(30);
    max_angle_per_center = deg2rad(120);
    // the following ones are multiplied by scale.
    min_segment_arc_length = 1;
    max_segment_arc_length = 10;
    min_cave_diameter = 2;
    max_cave_diameter = 8;
    min_radius = 10;
    max_radius = 30;
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
            start_angle = Math.PI / 2;
        } else {
            // if prev exists, use its settings
            start_inner_r = prev.inner_edge.r_start;
            start_outer_r = prev.outer_edge.r_start;
            start_angle = prev.start_angle;
        }
        // determine new segment's angle via arc length.
        let arc_length = random_range(this.min_segment_arc_length, this.max_segment_arc_length);
        let angle_delta = arc_length / radius * (ccw ? +1 : -1);

        let [end_inner_r, end_outer_r] = this.get_random_inner_outer_radius(radius);

        return new Segment(center, radius, start_angle, start_angle + angle_delta, ccw,
            start_inner_r, start_outer_r, end_inner_r, end_outer_r);
    }

    constructor (arc_length: number, scale: number) {
        this.segments.push(new Segment({x:100, y:100}, 50, Math.PI / 2, Math.PI/4, false, 40, 60, 30, 70));
        this.current_segment = this.segments[0];
        this.spawn = this.current_segment.centroid;
    }

    private constructorOLD(arc_length: number, scale: number) {
        this.min_segment_arc_length *= scale;
        this.max_segment_arc_length *= scale;
        this.min_cave_diameter *= scale;
        this.max_cave_diameter *= scale;
        this.min_radius *= scale;
        this.max_radius *= scale;

        // construct segments
        let current_radius = random_range(this.min_radius, this.max_radius);
        let current_center = { x: 0, y: 0 }; // SETTING: starting at 0,0
        let currently_ccw = false;
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
                let max_segment_angle = this.max_segment_arc_length / current_radius;
                if (last.rotation_ccw) {
                    let direction = normalize(last.end_angle + Math.PI / 2);
                    if (direction + max_segment_angle > Math.PI / 2)
                        may_go_backwards = true;
                } else {
                    let direction = normalize(last.end_angle - Math.PI / 2);
                    if (direction - max_segment_angle < Math.PI * 3 / 2)
                        may_go_backwards = true;
                }
                let switch_center = enclosed_angle_of_current_center > target_enclosed_angle_of_current_center || may_go_backwards;
                let switch_direction = may_go_backwards || Math.random() > .5; // only make it random if we don't have to.
                if (switch_center) {
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
            if (last !== null) {
                new_segment.prev = last;
            }
            enclosed_angle_of_current_center += new_segment.enclosed_angle;
            total_arc_length += new_segment.arc_length;
        }
        this.current_segment = this.segments[0];
        this.spawn = this.current_segment.centroid;
    }

    public update(ship: Point): ShipState {
        let curr = this.current_segment;
        let pos = curr.get_point_position(curr.to_polar(ship));
        switch (pos) {
            case "wall":
                return "wall";
            case "front":
                if (curr.next !== null) {
                    this.current_segment = curr.next;
                    return "alive";
                } else {
                    return "end";
                }
            case "inside":
                return "alive";
            case "rear":
                if (curr.prev !== null) {
                    this.current_segment = curr.prev;
                    return "alive";
                } else {
                    return "wall"; // SETTING: start wall is currently closed.
                }
            default:
                throw new Error("oops");
        }
    }

    public draw(context: CanvasRenderingContext2D) {
        // TODO don't draw segments out of screen!!!!
        {
            // close cave start
            context.beginPath();
            let a = this.segments[0].outer_edge.start;
            let b = this.segments[0].inner_edge.start;
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
        }
        {
            // draw upper side. SETTING this relies on the fact that the first segment is always clockwise!
            context.beginPath();
            let start = this.segments[0].outer_edge.start;
            context.moveTo(start.x, start.y);
            for (let segment of this.segments) {
                let next: Point;
                if (segment.rotation_ccw)
                    next = segment.inner_edge.end;
                else
                    next = segment.outer_edge.end;
                context.lineTo(next.x, next.y);
            }
            context.stroke();
        }
        {
            // now draw lower side.
            context.beginPath();
            let start = this.segments[0].inner_edge.start;
            context.moveTo(start.x, start.y);
            for (let segment of this.segments) {
                let next: Point;
                if (segment.rotation_ccw)
                    next = segment.outer_edge.end;
                else
                    next = segment.inner_edge.end;
                context.lineTo(next.x, next.y);
            }
            context.stroke();
        }
        // leave end open.
    }
}