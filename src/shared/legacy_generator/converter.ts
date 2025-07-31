

import { Cave } from "../cave";
import { Point, PointPair } from "../misc";
import { generator_config } from "./config";
import { Segment } from "./segment";

/**
 * Converts the "legacy cave" object to the new format.
 * This shoud be removed at some point, when the legacy generator is not needed anymore...
 * 
 * Of counter-clockwise segments, the points of the *inner* edge become the A points,
 * for clockwise ones, the B points, and vice versa.
 */
export function convert_cave(segments: Segment[]): Cave {
    let point_pairs: PointPair[] = []
    // we add the start of the first segment, and then all ends only.
    {
        let s = segments[0]
        if (s.rotation_ccw) {
            point_pairs.push({ a: s.inner_edge.start, b: s.outer_edge.start })
        } else {
            point_pairs.push({ b: s.inner_edge.start, a: s.outer_edge.start })
        }
    }
    for (let s of segments) {
        if (s.rotation_ccw) {
            point_pairs.push({ a: s.inner_edge.end, b: s.outer_edge.end })
        } else {
            point_pairs.push({ b: s.inner_edge.end, a: s.outer_edge.end })
        }
    }

    // spawn point
    let spawn_index = generator_config.spawn_segment_index
    let spawn_a = point_pairs[spawn_index]
    let spawn_b = point_pairs[spawn_index + 1]
    let spawn = centroidOfQuad(spawn_a.a, spawn_a.b, spawn_b.a, spawn_b.b)

    return new Cave(point_pairs, generator_config.spawn_segment_index, spawn)
}


function centroidOfQuad(a: Point, b: Point, c: Point, d: Point): Point {
    // thx chatgpt
    return {
        x: (a.x + b.x + c.x + d.x) / 4,
        y: (a.y + b.y + c.y + d.y) / 4
    };
}