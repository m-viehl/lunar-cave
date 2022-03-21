import { Cave } from "./cave";
import { ShipState, Key, Point, Screen } from "./misc";
import { Ship, Ship1 } from "./ship";

// public variables
var canvas: HTMLCanvasElement;
var context: CanvasRenderingContext2D;
var start_time: number | undefined = undefined;
var t: number = 0; // seconds since start
var last_tick: number = 0;
var width: number;
var height: number;
var paused = true;

var scale = 20; // pixels, unit for game scaling
var g = 9.81 * scale;

var game: Game;

// classes
class Game {
    lander: Ship;
    cave: Cave;

    // settings
    speed_for_scale_1 = scale * 5;

    constructor() {
        this.lander = new Ship1(0, 0, scale, g);
        this.new_cave();
        this.reset();
    }

    public logic(dt: number) {
        this.lander.tick(dt);
        // collision
        let state = this.cave.check_collision(this.lander, true);
        switch (state) {
            case ShipState.end:
                this.new_cave();
            case ShipState.wall:
                this.reset();
                return;
        }
        for (let p of this.lander.collision_points) {
            let state = this.cave.check_collision(p);
            switch (state) {
                case ShipState.alive:
                    continue;
                case ShipState.end:
                    this.new_cave();
                case ShipState.wall:
                    this.reset();
            }
            return;
        }
    }

    private new_cave() {
        this.cave = new Cave(350 * scale, scale);
    }

    public reset() {
        this.cave.reset();
        this.lander.x = this.cave.spawn.x;
        this.lander.y = this.cave.spawn.y;
        this.lander.reset();
        paused = true;
    }

    private key(e: KeyboardEvent, down: boolean) {
        switch (e.code) {
            case "KeyH":
                if (e.shiftKey && !down) {
                    this.cave.help_lines = !this.cave.help_lines;
                    draw();
                }
                break;
            case "KeyW":
            case "ArrowUp":
                if (down)
                    unpause();
                this.lander.key(Key.boost, down);
                break;
            case "KeyA":
            case "ArrowLeft":
                if (down)
                    unpause();
                this.lander.key(Key.left, down);
                break;
            case "KeyD":
            case "ArrowRight":
                if (down)
                    unpause();
                this.lander.key(Key.right, down);
                break;
        }
    }

    public keyup(e: KeyboardEvent) {
        this.key(e, false);
    }

    public keydown(e: KeyboardEvent) {
        this.key(e, true);
    }

    public draw() {
        // fill black
        context.fillStyle = "#344745"
        context.fillRect(0, 0, width, height);

        let scale_factor = Math.max(0.5, Math.min(1.5, this.lander.speed / this.speed_for_scale_1));
        context.resetTransform();
        context.translate(
            (-this.lander.x + width / 2) / scale_factor,
            (-this.lander.y + height / 2) / scale_factor);
        context.scale(1 / scale_factor, 1 / scale_factor);

        // draw cave
        context.fillStyle = "#d1d1d1";
        this.cave.draw(context, {
            upper_left: { x: this.lander.x - width / 2 * scale_factor, y: this.lander.y - height / 2 * scale_factor },
            lower_right: { x: this.lander.x + width / 2 * scale_factor, y: this.lander.y + height / 2 * scale_factor }
        });
        context.resetTransform();
        context.translate(width / 2, height / 2);
        context.rotate(this.lander.angle);
        context.scale(1 / scale_factor, 1 / scale_factor);
        // lander
        this.lander.draw(context);
    }
}


// main functions
function draw() {
    context.resetTransform();
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (game !== undefined)
        game.draw();
}


function loop(now: number = 0) {
    now /= 1000; // convert to seconds
    if (start_time === undefined) {
        // 1st run
        start_time = now;
        last_tick = now;
    } else {
        // normal tick
        t = now - start_time;
        let dt = now - last_tick;
        last_tick = now;

        game.logic(dt);
        draw();
    }
    if (!paused)
        window.requestAnimationFrame(loop);
}

function unpause() {
    if (!paused)
        return;
    paused = false;
    start_time = undefined;
    window.requestAnimationFrame(loop);
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

function main() {
    document.body.removeChild(document.getElementById("noscript-text")!);
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    context = canvas.getContext("2d")!
    resized();
    // global variables are set

    game = new Game();
    draw();

    window.addEventListener("resize", resized);
    window.addEventListener("keydown", (e) => game.keydown(e));
    window.addEventListener("keyup", (e) => game.keyup(e));
    // loop is started when a key is pressed
}

main();