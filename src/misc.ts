// types
export interface Point {
    x: number,
    y: number
}
    
export interface Screen {
    upper_left: Point,
    lower_right: Point
}


// enums
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