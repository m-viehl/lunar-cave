import type { Point, PointPair } from "./misc";

export enum PointState {
    INSIDE, CRASH, FINISH
}

/**
 * Cave is defined by point-pairs:
 * 
 * A0------A1------A2----...
 * |       |       |
 * |  this | is    |  inside the cave
 * |       |       |
 * B0-----B1------B2----...
 * 
 * All a-points in this.point_pairs are the "upper" wall of the cave,
 * and all b-points are the lower one.
 */
export class Cave {
    point_pairs: PointPair[]
    // TODO I somehow want to optimize this further and avoid objects in the cave
    // definition completely. Could write all coordinates in one big number array... :)
    // But, not now. Don't optimize early ^^

    /**
     * current_segment_index is used to determine which segments to check for collision checks, and
     * is updated during operation.
     * spawn_segment_index retains the initial one for resets.
     */
    current_segment_index!: number // 0 is between point pairs 0 and 1, and so on
    spawn_segment_index: number
    goal_segment_index: number

    spawn_location: Point

    constructor(
        point_pairs: PointPair[],
        spawn_segment_index: number,
        spawn_location: Point,
        goal_segment_index: number,
    ) {
        this.spawn_segment_index = spawn_segment_index
        this.goal_segment_index = goal_segment_index
        this.point_pairs = point_pairs
        this.spawn_location = spawn_location
        this.reset()
    }

    /**
     * resets the current_segment_index to spawn to reuse this object.
     */
    public reset() {
        this.current_segment_index = this.spawn_segment_index
    }

    /**
    * Relative to current_segment_index, specifies the order of segments to do collision checks for.
    * As in most cases, we'll be in the current segment, a reasonable checking order will reduce
    * collision check runtimes in most cases.
    */
    static readonly segment_check_order = [0, 1, -1, 2, -2]

    /**
     * Checks whether a point is inside the cave, in the wall or in the goal region.
     * For simplicity, any point in the last segment counts as goal.
     * 
     * Also updates the current segment index of the cave.
     * This index points at the current position, such that not all cave segments
     * are checked but only a few around this one.
     * 
     * This function assumes that the points p of successive calls are quite close together,
     * where "quite close" means "less than one segment size apart".
     * 
     * @param p the point to check for collisions
     * @returns whether the point has crashed with cave walls
     */
    public get_point_state(p: Point): PointState {
        // if not in the current segment, check the ones around it
        for (let j of Cave.segment_check_order) {
            let i = this.current_segment_index + j

            if (i < 0 || i >= this.point_pairs.length)
                continue

            if (this.is_in_segment(p, i)) {
                // point is in segment -> update current segment!
                this.current_segment_index = i
                if (i == this.goal_segment_index) {
                    return PointState.FINISH
                }
                return PointState.INSIDE // not crashed
            }
        }
        return PointState.CRASH // not found in any segment, i.e. crashed
    }

    private is_in_segment(p: Point, index: number) {
        let pair1 = this.point_pairs[index]!
        let pair2 = this.point_pairs[index + 1]!
        return pointInConvexQuad(
            p,
            pair1.a, pair1.b, pair2.b, pair2.a,
        )
    }

}



// COLLISION CHECK, written by ChatGPT. Thanks.
function collision_sign(p1: Point, p2: Point, p3: Point): number {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

/**
 * Points a,b,c,d need to be clockwise or ccw. points of a *convex* quadrilateral.
 * Checks whether p is inside.
 */
export function pointInConvexQuad(p: Point, a: Point, b: Point, c: Point, d: Point): boolean {
    const s1 = collision_sign(p, a, b);
    const s2 = collision_sign(p, b, c);
    const s3 = collision_sign(p, c, d);
    const s4 = collision_sign(p, d, a);

    return (s1 >= 0 && s2 >= 0 && s3 >= 0 && s4 >= 0) ||
        (s1 <= 0 && s2 <= 0 && s3 <= 0 && s4 <= 0);
}