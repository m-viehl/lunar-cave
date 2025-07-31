/**
 * functionality to render a shared/logic/game object to a canvas
 * 
 * maybe, the avg. speed over the last time (for zoom) should also be calculated in the game object?
 */

import { Cave } from "../shared/cave";
import { Ship } from "../shared/ship";

// configurations
let zoom_config = {
    "speed_avg_window_size": 90,
    "min_zoom_factor": 0.5,
    "max_zoom_factor": 1.5,
    "min_speed": 0,
    "max_speed": "scaled:30" // TODO maaaah jetzt brauch ich auch hier den verdammten scale. Kümmer dich drum!
}

let draw_config = {
    "background": "#344745",
    "foreground": "#d1d1d1",
    "stroke_col": "black",
    "end_line_width": "scaled:.3",
    "end_col": "#009955",
    "stroke_width": 1.1
}

// variables
let canvas = document.getElementById("canvas") as HTMLCanvasElement;
let context = canvas.getContext("2d")!;
let width = 0, height = 0;


function scale_from_speed(v: number) {
    // TODO switch to https://en.wikipedia.org/wiki/Exponential_smoothing !
    // TODO and make it framerate-agnostic!
    // running avg
    this.last_speeds.push(v);
    this.speed_sum += v;
    if (this.last_speeds.length > config.game.zoom.speed_avg_window_size)
        this.speed_sum -= this.last_speeds.shift()!;
    v = this.speed_sum / config.game.zoom.speed_avg_window_size;

    if (v < config.game.zoom.max_speed) {
        return 1 - Math.cos(Math.PI * v / config.game.zoom.max_speed) * config.game.zoom.min_zoom_factor;
    }
    return config.game.zoom.max_zoom_factor;
}



function draw_main(ship: Ship, cave: Cave) {
    context.resetTransform();
    context.clearRect(0, 0, canvas.width, canvas.height);

    // fill background
    context.fillStyle = draw_config.background;
    context.fillRect(0, 0, width, height);

    let scale_factor = scale_from_speed(ship.speed);

    let base_line_width = draw_config.stroke_width * scale_factor;
    // this makes the line width constant, independent from scale!

    context.resetTransform();
    context.translate(
        (-ship.x) / scale_factor + width / 2,
        (-ship.y) / scale_factor + height / 2);
    context.scale(1 / scale_factor, 1 / scale_factor);
    // draw cave
    context.lineWidth = base_line_width;
    context.fillStyle = draw_config.foreground;
    context.strokeStyle = draw_config.stroke_col;

    draw_cave({
        upper_left: { x: ship.x - width / 2 * scale_factor, y: ship.y - height / 2 * scale_factor },
        lower_right: { x: ship.x + width / 2 * scale_factor, y: ship.y + height / 2 * scale_factor }
    });
    // lander
    context.resetTransform();
    context.translate(width / 2, height / 2);
    context.rotate(ship.angle);
    context.scale(1 / scale_factor, 1 / scale_factor);

    // reset line style: changed by cave.draw for end line
    context.strokeStyle = "black";
    context.lineWidth = base_line_width;

    ship.draw(context);
    // set progress text
    progresstext.innerText = `${Math.round(Math.max(0, this.cave.progress * 100))}%`
}

function draw_ship(context: CanvasRenderingContext2D) {
    // TODO WARNING: this depends on the translation done before in game.ts!
    // unify the context translations, zoom etc.!
    // draw thruster flame
    context.strokeStyle = style.lander.stroke_col;
    if (this.thrust_factor > 0) {
        context.beginPath();
        context.moveTo(-this.size / 3, this.size / 3);
        context.lineTo(0, this.size * (1 + 1 / 3) * this.thrust_factor);
        context.lineTo(+this.size / 3, this.size / 3);
        context.fillStyle = style.lander.fire_col;
        context.fill();
        context.stroke();
    }
    // draw body
    context.fillStyle = style.lander.body_col;
    context.fillRect(-this.size / 2, -this.size / 3, this.size, this.size * 2 / 3);
    context.strokeRect(-this.size / 2, -this.size / 3, this.size, this.size * 2 / 3);
}



function draw_cave(scr: Screen) {
    // get segments on screen
    let segments: Segment[] = [this.current_segment];
    {
        let current: Segment;
        let off_screen_count = 0;
        // traverse forwards
        current = this.current_segment;
        while (current.next !== null) {
            current = current.next;
            segments.push(current);
            if (!this.segment_on_screen(current, scr)) {
                // we go up to n segments off-screen to avoid weird artifacts
                if (++off_screen_count > 4)
                    break;
            }
        }
        // traverse backwards
        current = this.current_segment;
        off_screen_count = 0;
        while (current.prev !== null) {
            current = current.prev;
            segments.unshift(current); // add at beginning
            if (!this.segment_on_screen(current, scr)) {
                // we go up to n segments off-screen to avoid weird artifacts
                if (++off_screen_count > 4)
                    break;
            }
        }
    }
    // draw a polygon from segments.
    context.beginPath();
    let curr = segments[0];
    let e = curr.rotation_ccw ? curr.inner_edge : curr.outer_edge;
    context.moveTo(e.start.x, e.start.y);
    // forwards
    for (let i = 0; i < segments.length; i++) {
        curr = segments[i];
        e = curr.rotation_ccw ? curr.inner_edge : curr.outer_edge;
        context.lineTo(e.end.x, e.end.y);
    }
    // now backwards
    curr = segments[segments.length - 1];
    e = curr.rotation_ccw ? curr.outer_edge : curr.inner_edge;
    context.lineTo(e.end.x, e.end.y);
    for (let i = segments.length - 1; i >= 0; i--) {
        curr = segments[i];
        e = curr.rotation_ccw ? curr.outer_edge : curr.inner_edge;
        context.lineTo(e.start.x, e.start.y);
    }
    context.closePath();
    context.fill();
    context.stroke();
    // draw finish line TODO or draw whole goal segment green?
    context.strokeStyle = "#009955";
    context.lineWidth = style.cave.end_line_width;
    context.beginPath();
    context.moveTo(this.end_line.start.x, this.end_line.start.y);
    context.lineTo(this.end_line.end.x, this.end_line.end.y);
    context.stroke();
}



function resized() {
    //if (window.innerWidth !== width || window.innerHeight < height || window.innerHeight > 1.2 * height) {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    if (game !== undefined) {
        draw();
    }
    //}
}
window.addEventListener("resize", resized);