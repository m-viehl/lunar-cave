export interface Point {
    x: number,
    y: number
}

export interface Screen {
    upper_left: Point,
    lower_right: Point
}


export enum ShipPosition {
    // relative to a segment
    before,
    after,
    inside,
    wall
}

export function random_range(min: number, max: number, int = false) {
    let r = min + Math.random() * (max - min);
    if (int)
        return Math.trunc(r)
    return r
}


export interface Line {
    start: Point,
    end: Point
}


export enum ShipState {
    alive,
    wall,
    end
}

export enum Key {
    left,
    right,
    boost
}