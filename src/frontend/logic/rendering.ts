/**
 * functionality to render a shared/logic/game object to a canvas
 * 
 * maybe, the avg. speed over the last time (for zoom) should also be calculated in the game object?
 */

import { Cave } from "../../shared/cave";
import { ConfigType } from "../../shared/config";
import { Point, PointPair } from "../../shared/misc";
import { Ship } from "../../shared/ship";

import { FrontendGame } from "./main";


// variables
let canvas = document.getElementById("canvas") as HTMLCanvasElement;
let context = canvas.getContext("2d")!;
let width = 0, height = 0;


function scale_from_speed(v: number, config: ConfigType): number {
    let max_speed = config.zoom_config.max_speed
    let min_zoom = config.zoom_config.min_zoom_factor
    if (v < max_speed) {
        return 1 - Math.cos(Math.PI * v / max_speed) * min_zoom;
    }
    return config.zoom_config.max_zoom_factor;
}


export function draw_main(frontend_game: FrontendGame) {
    let ship = frontend_game.game.ship
    let cave = frontend_game.game.cave
    let config = frontend_game.config

    context.resetTransform();
    context.clearRect(0, 0, canvas.width, canvas.height);

    // fill background
    context.fillStyle = config.draw_config.cave.background;
    context.fillRect(0, 0, width, height);

    let scale_factor = scale_from_speed(frontend_game.speed_smoothed, config);

    context.resetTransform();
    context.translate(
        (-ship.x) / scale_factor + width / 2,
        (-ship.y) / scale_factor + height / 2);
    context.scale(1 / scale_factor, 1 / scale_factor);
    // draw cave
    draw_cave(
        cave,
        config,
        { x: ship.x - width / 2 * scale_factor, y: ship.y - height / 2 * scale_factor },
        { x: ship.x + width / 2 * scale_factor, y: ship.y + height / 2 * scale_factor }
    );
    // lander
    context.resetTransform();
    context.translate(width / 2, height / 2);
    context.rotate(ship.angle);
    context.scale(1 / scale_factor, 1 / scale_factor);

    // reset line style: changed by cave.draw for end line
    context.strokeStyle = "black";

    draw_ship(ship, config)
}

function draw_ship(ship: Ship, config: ConfigType) {
    let s = config.ship_config.size
    // draw thruster flame
    if (ship.thrust_factor > 0) {
        context.beginPath();
        context.moveTo(-s / 3, s / 3);
        context.lineTo(0, s * (1 + 1 / 3) * ship.thrust_factor);
        context.lineTo(+s / 3, s / 3);
        context.fillStyle = config.draw_config.lander.fire_col;
        context.fill();
    }
    // draw body
    context.fillStyle = config.draw_config.lander.body_col;
    context.fillRect(-s / 2, -s / 3, s, s * 2 / 3);
}


function is_point_pair_on_screen(
    pair: PointPair,
    upper_left: Point,
    lower_right: Point
): boolean {
    const { a, b } = pair

    const isOnScreen = (p: Point): boolean => {
        return (
            p.x >= upper_left.x &&
            p.x <= lower_right.x &&
            p.y >= upper_left.y &&
            p.y <= lower_right.y
        )
    }

    return isOnScreen(a) || isOnScreen(b)
}



function draw_cave(cave: Cave, config: ConfigType, upper_left: Point, lower_right: Point) {
    // determine which segments to draw
    // let draw_first = -1
    // let draw_last = -1

    // for (let i = 0; i < cave.point_pairs.length; i++) {
    //     let pp = cave.point_pairs[i]
    //     if (draw_first == -1) {
    //         // search for first visible one
    //         if (is_point_pair_on_screen(pp, upper_left, lower_right)) {
    //             // then save the one before, which is fully off-screen
    //             draw_first = Math.max(0, i - 1)
    //         }
    //     } else {
    //         // search for last visible one
    //         if (!is_point_pair_on_screen(pp, upper_left, lower_right)) {
    //             // then save the next one, which is fully off-screen
    //             draw_first = Math.min(cave.point_pairs.length - 1, i + 1)
    //         }
    //     }
    // }

    // TODO tmp? Draw all segments, even if out of screen!
    let draw_first = 0
    let draw_last = cave.point_pairs.length - 1

    // now draw a polygon with all those segments.
    context.fillStyle = config.draw_config.cave.foreground;
    context.beginPath();
    let p = cave.point_pairs[draw_first]
    context.moveTo(p.a.x, p.a.y);
    // forward pass, draw all A points (see cave doc, all A/B points are on one side)
    for (let i = draw_first + 1; i <= draw_last; i++) {
        p = cave.point_pairs[i]
        context.lineTo(p.a.x, p.a.y);
    }
    // backward pass, draw all B points
    for (let i = draw_last; i >= draw_first; i--) {
        p = cave.point_pairs[i]
        context.lineTo(p.b.x, p.b.y);
    }
    // finish polygon
    context.closePath();
    context.fill();

    // draw goal segment
    context.fillStyle = config.draw_config.cave.end_col
    context.beginPath()
    let p1 = cave.point_pairs[cave.goal_segment_index]
    let p2 = cave.point_pairs[cave.goal_segment_index + 1]
    context.moveTo(p1.a.x, p1.a.y)
    context.lineTo(p2.a.x, p2.a.y)
    context.lineTo(p2.b.x, p2.b.y)
    context.lineTo(p1.b.x, p1.b.y)
    context.closePath()
    context.fill()
}

export function screen_size_changed() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
