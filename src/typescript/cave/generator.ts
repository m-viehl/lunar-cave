import Config from "../config/config_type";
import { Point } from "../misc";
import * as angle_tools from "./angle_tools";
import { Segment } from "./segment";

var random: () => number;

/**
 * Initialize the random() function using a given seed.
 * Calls the new generator function ten times for better initialization.
 * 
 * This uses the mulberry32 algorithm. Taken from:
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 * 
 * @param a the random seed
 */
function randomize_mulberry32(a: number) {
    let out = function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    for (let i = 0; i < 10; i++) {
        out();
    }
    random = out;
}

export function generate_cave(arc_length: number, config: Config, seed: number): Segment[] {
    randomize_mulberry32(seed);
    let segments: Segment[] = [];

    // construct segments
    // SETTING: here are the starting segment settings
    let current_radius = random_range(config.cave.generator.min_radius, config.cave.generator.max_radius);
    let current_center = { x: 0, y: 0 };
    let currently_ccw = random() > 0.5;

    let total_arc_length = 0;
    let enclosed_angle_of_current_center = 0;
    let target_enclosed_angle_of_current_center = random_range(config.cave.generator.min_angle_per_center, config.cave.generator.max_angle_per_center);

    while (total_arc_length < arc_length) {
        // append new segment
        let last: Segment | null = null;
        if (segments.length > 0)
            last = segments[segments.length - 1];
        if (last !== null) {
            // determine whether to switch the current center.
            let may_go_backwards = false;
            {
                let max_segment_angle = config.cave.generator.max_segment_arc_length / current_radius;
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
            let switch_direction = may_go_backwards || random() > .5; // only make it random if we don't have to.
            if (switch_center) {
                if (switch_direction)
                    enclosed_angle_of_current_center = 0;
                target_enclosed_angle_of_current_center = random_range(config.cave.generator.min_angle_per_center, config.cave.generator.max_angle_per_center);
                // move center.
                let junction_point = {
                    x: last.center.x + Math.cos(last.end_angle) * last.radius,
                    y: last.center.y + Math.sin(last.end_angle) * last.radius
                }
                let v = { // union vector from junction point to last.center
                    x: (last.center.x - junction_point.x) / last.radius,
                    y: (last.center.y - junction_point.y) / last.radius
                }
                let new_radius = random_range(config.cave.generator.min_radius, config.cave.generator.max_radius);
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
        let new_segment = next_segment(current_radius, current_center, currently_ccw, last, config);
        segments.push(new_segment);
        enclosed_angle_of_current_center += new_segment.enclosed_angle;
        total_arc_length += new_segment.arc_length;
    }
    return segments;
}

function random_range(min: number, max: number, int = false) {
    let r = min + random() * (max - min);
    if (int)
        return Math.trunc(r)
    return r
}

function get_random_inner_outer_radius(current_radius: number, config: Config): [number, number] {
    return [
        current_radius - random_range(config.cave.generator.min_cave_diameter / 2, config.cave.generator.max_cave_diameter / 2),
        current_radius + random_range(config.cave.generator.min_cave_diameter / 2, config.cave.generator.max_cave_diameter / 2)
    ]
}

function next_segment(radius: number, center: Point, ccw: boolean, prev: Segment | null, config: Config) {
    let start_inner_r: number;
    let start_outer_r: number;
    let start_angle: number;
    if (prev === null) {
        // standard settings if prev is null
        [start_inner_r, start_outer_r] = get_random_inner_outer_radius(radius, config);
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
    let arc_length = random_range(config.cave.generator.min_segment_arc_length, config.cave.generator.max_segment_arc_length);
    let angle_delta = arc_length / radius * (ccw ? +1 : -1);

    let [end_inner_r, end_outer_r] = get_random_inner_outer_radius(radius, config);

    return new Segment(center, radius, start_angle, start_angle + angle_delta, ccw,
        start_inner_r, start_outer_r, end_inner_r, end_outer_r, prev === null ? undefined : prev);
}