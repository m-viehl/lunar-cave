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