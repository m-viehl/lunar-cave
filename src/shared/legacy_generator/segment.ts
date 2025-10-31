import { type Point } from "../misc";
import * as angle_tools from "./angle_tools";
import { Edge } from "./edge";


export class Segment {
    readonly center: Point; // center of the corresponding circle
    readonly radius: number;
    readonly centroid: Point; // point in the middle of the segment
    readonly start_angle: number;
    readonly end_angle: number;
    readonly rotation_ccw: boolean;
    readonly arc_length: number;
    readonly enclosed_angle: number;
    readonly previous_arc_length: number; // sum of arc length of all previous segments

    readonly inner_edge: Edge;
    readonly outer_edge: Edge;

    _next: Segment | null = null;
    readonly prev: Segment | null = null;

    public get next() {
        return this._next;
    }

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
            previous._next = this;
            this.prev = previous;
            this.previous_arc_length = previous.previous_arc_length + previous.arc_length;
        } else {
            this.previous_arc_length = 0;
        }
    }
}