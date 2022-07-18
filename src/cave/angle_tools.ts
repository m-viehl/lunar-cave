import { Point } from "../misc"

/**
 * A type representing a polar coordinate.
 */
export type Polar = { phi: number, r: number };

/**
 * Converts a given point from cartesian to polar coordinates.
 * @param p The point in cartesian coordinates
 * @param center The center of the polar coordinate system in cartesian coordinates
 * @returns `p` converted to a polar coordinate
 */
export function to_polar(p: Point, center: Point): Polar {
    // returns the polar coordinates of p relative to this segment's center
    return {
        phi: Math.atan2(p.y - center.y, p.x - center.x),
        r: Math.hypot(p.x - center.x, p.y - center.y)
    };
}

/**
 * Normalizes an angle: Returns the given angle modulo 2 pi.
 * The given angle must not be less than -8 pi.
 * @param alpha The angle to normalize
 * @returns The normalized angle
 */
export function normalize(alpha: number) {
    return (alpha + 8 * Math.PI) % (2 * Math.PI);
}

/**
 * Calculates whether a given polar angle `phi` lies inside of a given angle range.
 * The angle range is defined counter-clockwise from start to end (possibly going over zero).
 * It may enclose more than 180 degrees. All angles must be given in radians.
 * @param start The start angle of the range
 * @param end The end angle of the range
 * @param phi The angle to determine the position of
 * @returns whether start lies in the defined range
 */
export function in_angle_range(start: number, end: number, phi: number) {
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

/**
 * Calculates the enclosed angle between two polar angles. Always returns the smaller enclosed angle `<= pi`.
 * @param phi the first angle, in radians
 * @param theta the second angle, in radians
 * @returns the enclosed angle between `phi` and `theta`, in radians
 */
export function angle_between(phi: number, theta: number) {
    // returns the *smaller* angle enclosed between phi and theta.
    phi = normalize(phi);
    theta = normalize(theta);
    if (phi < theta) {
        return Math.min(theta - phi, phi + (2 * Math.PI - theta));
    } else {
        return Math.min(phi - theta, theta + (2 * Math.PI - phi));
    }
}

/**
 * Calculates the enclosed angle between two vectors in the 2d plane.
 * Always returns the smaller enclosed angle `<= pi`.
 * Each vector is defined by a `Point` (x-y-pair) and points from the origin to the given point.
 * 
 * @param a A `Point` defining the first vector.
 * @param b A `Point` defining the second vector.
 * @returns The angle between the vectors, in radians.
 */
export function angle_between_vectors(a: Point, b: Point) {
    return Math.acos((a.x * b.x + a.y * b.y) / (Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y)));
}

/**
 * Converts an angle from degrees to radians.
 * @param deg a number in degrees
 * @returns `deg` converted to radians
 */
export function deg2rad(deg: number) {
    return deg / 360 * 2 * Math.PI;
}

/**
 * See `get_angle_position` for details.
 */
export enum AnglePosition {
    before,
    after,
    inside,
    opposite
}
/**
 * Evaluates the position of an angle `phi` relative to an "angle range". The angle range is defined by a start and an end angle.
 * - If `phi` is inside this range, the result is `inside`.
 * - If `phi` lies outside of the range, but inside the mirrored range, the result is `opposite`.
 * - If `phi` is not in the mirrored range, but outside in the forwards rotational direction (chosen by `rotation_ccw`), the result is `after`.
 * - Analog to `after`, if not `opposite` and outside but in the backwards direction, the result is `before`.
 * 
 * @param phi the angle to evaluate the position for
 * @param range_start the start angle of the range
 * @param range_end the end angle of the range
 * @param rotation_ccw whether "before" is in the couter-clockwise (true) or clockwise (false) direction of the angle range
 * @returns an AnglePosition indicating the position of phi relative to the given range
 */
export function get_angle_position(phi: number, range_start: number, range_end: number, rotation_ccw: boolean): AnglePosition {
    let A: number;
    let B: number;
    let ccw = rotation_ccw;
    if (ccw) {
        B = range_start;
        A = range_end;
    } else {
        A = range_start;
        B = range_end;
    }
    if (in_angle_range(B, A, phi)) {
        return AnglePosition.inside;
    }
    if (ccw) {
        if (in_angle_range(B - Math.PI / 2, B, phi))
            return AnglePosition.before;
        if (in_angle_range(A, A + Math.PI / 2, phi))
            return AnglePosition.after;
        return AnglePosition.opposite
    } else {
        if (in_angle_range(A, A + Math.PI / 2, phi))
            return AnglePosition.before;
        if (in_angle_range(B - Math.PI / 2, B, phi))
            return AnglePosition.after;
        return AnglePosition.opposite
    }
}