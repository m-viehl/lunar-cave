import { Cave, Point } from "./cave.js"

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
var g = 10 * scale; // TODO adapt.

var game: Game;

// classes
class Game {
    lander: Lander;
    cave: Cave;

    constructor() {
        this.cave = new Cave(20 * scale, scale);
        this.lander = new Lander(0, 0);
        this.reset();
    }

    public logic(dt: number) {
        this.lander.physics(dt);
        // collision
        let state = this.cave.update(this.lander);
        switch (state) {
            case "end":
                console.log("END REACHED");
            case "wall":
                this.reset();
        }
    }

    public reset() {
        this.cave.reset();
        this.lander.x = this.cave.spawn.x;
        this.lander.y = this.cave.spawn.y;
        this.lander.vx = 0;
        this.lander.vy = 0;
        this.lander.angle = 0;
        paused = true;
    }

    private key(e: KeyboardEvent, down: boolean) {
        if (down) {
            unpause();
        }
        switch (e.code) {
            case "KeyW":
            case "ArrowUp":
                this.lander.thrust = down ? 1 : 0;
                break;
            case "KeyA":
            case "ArrowLeft":
                this.lander.rotation_thrust = down ? -1 : 0;
                break;
            case "KeyD":
            case "ArrowRight":
                this.lander.rotation_thrust = down ? +1 : 0;
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
        // context.translate(-this.lander.x + width / 2, -this.lander.y + height / 2);
        this.cave.draw(context);
        // context.resetTransform();
        // context.translate(this.lander.x, this.lander.y);
        // context.rotate(this.lander.angle);
        context.fillRect(this.lander.x, this.lander.y, 1, 1); // TODO
        //this.lander.draw();
    }
}


class Lander implements Point {
    // position
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle = 0.0;
    // controls: set these from outside! They are read in physics() to update position variables.
    thrust = 0; // 1 = full thrust
    rotation_thrust = 0; // -1 = full left, +1 = full right (TODO andersrum?)
    // settings
    readonly size = 1 * scale;
    readonly acc = 3 * g; // maximum thruster acceleration
    readonly rotation_speed = 180 /* degrees per second */ / 360 * 2 * Math.PI;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
    }

    public draw() {
        // draw body
        context.strokeRect(-this.size / 2 + this.x, -this.size / 3 + this.y, this.size, this.size * 2 / 3);
        // draw thruster flame
        if (this.thrust > 0) {
            context.beginPath();
            context.moveTo(-this.size / 3 + this.x, this.size / 3 + this.y);
            context.lineTo(0 + this.x, this.size * (1 + 1 / 3) * this.thrust + this.y);
            context.lineTo(+this.size / 3 + this.x, this.size / 3 + this.y);
            context.stroke();
        }
    }

    public physics(dt: number) {
        // when landed, no gravitation
        // rotation
        this.angle += this.rotation_speed * this.rotation_thrust * dt;
        // calc acceleration
        let ax = - this.thrust * this.acc * Math.cos(this.angle + Math.PI / 2);
        let ay = - this.thrust * this.acc * Math.sin(this.angle + Math.PI / 2) + g;
        // apply acceleration
        this.vx += ax * dt;
        this.vy += ay * dt;
        // apply velocities
        this.x += this.vx * dt;
        this.y += this.vy * dt;
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
    if (window.innerWidth !== width || window.innerHeight < height || window.innerHeight > 1.2 * height) {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        if (game !== undefined) {
            draw();
        }
    }
}

export function main() {
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
