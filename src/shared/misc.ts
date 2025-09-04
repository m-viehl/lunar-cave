export interface Point {
    x: number
    y: number
}

export interface PointPair {
    a: Point
    b: Point
}

export interface TickLog {
    dt: number
    thrust: boolean
    left: boolean
    right: boolean
}