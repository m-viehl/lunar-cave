import { Point, ShipPosition } from "../misc";
import * as angle_tools from "./angle_tools";
import { Edge } from "./edge";


export class Segment {
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