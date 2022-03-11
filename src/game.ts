import { Cave, Point, ShipState } from "./cave.js"

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
        this.lander = new Lander(0, 0);
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
        if (down) {
            unpause();
        }
        switch (e.code) {
            case "KeyW":
            case "ArrowUp":
                this.lander.thrust = down;
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
        // fill black
        context.fillStyle = "#344745"
        context.fillRect(0, 0, width, height);
        context.translate(-this.lander.x + width / 2, -this.lander.y + height / 2);
        // draw cave
        context.fillStyle = "#d1d1d1";
        this.cave.draw(context, {
            upper_left: { x: this.lander.x - width / 2, y: this.lander.y - height / 2 },
            lower_right: { x: this.lander.x + width / 2, y: this.lander.y + height / 2 }
        });
        // lander
        context.translate(this.lander.x, this.lander.y);
        context.rotate(this.lander.angle);
        this.lander.draw();
    }
}


class Lander implements Point {
    // state
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    thrust_factor = 0; // 1 = full thrust
    // controls: set these from outside! They are read in physics() to update position variables.
    rotation_thrust = 0; // -1 = full left, +1 = full right (TODO andersrum?)
    thrust : boolean;
    // settings
    readonly delta_thrust_factor_per_s = 7;
    readonly size = 1 * scale;
    readonly acc = 3 * g; // maximum thruster acceleration
    readonly rotation_speed = 180 /* degrees per second */ / 360 * 2 * Math.PI;
    collision_points: Point[];

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.reset();
        this.collision_points = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]
        this.calc_collision_points();
    }

    public reset() {
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.thrust_factor = 0;
        this.thrust = false;
        this.rotation_thrust = 0;
    }

    public draw() {
        // draw thruster flame
        if (this.thrust_factor > 0) {
            context.fillStyle = "#02e5ca"
            context.beginPath();
            context.moveTo(-this.size / 3, this.size / 3);
            context.lineTo(0, this.size * (1 + 1 / 3) * this.thrust_factor);
            context.lineTo(+this.size / 3, this.size / 3);
            context.fill();
        }
        // draw body
        context.fillStyle = "#5c5e5e"
        context.fillRect(-this.size / 2, -this.size / 3, this.size, this.size * 2 / 3);
    }

    public tick(dt: number) {
        if (this.thrust) {
            this.thrust_factor += this.delta_thrust_factor_per_s * dt;
            this.thrust_factor = Math.min(this.thrust_factor, 1);
        } else {
            this.thrust_factor -= this.delta_thrust_factor_per_s * dt;
            this.thrust_factor = Math.max(this.thrust_factor, 0);
        }
        if (this.thrust_factor < 0)
            alert("thrust factor < 0!"); // debug
        // when landed, no gravitation
        // rotation
        this.angle += this.rotation_speed * this.rotation_thrust * dt;
        // calc acceleration
        let ax = - this.thrust_factor * this.acc * Math.cos(this.angle + Math.PI / 2);
        let ay = - this.thrust_factor * this.acc * Math.sin(this.angle + Math.PI / 2) + g;
        // apply acceleration
        this.vx += ax * dt;
        this.vy += ay * dt;
        // apply velocities
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        this.calc_collision_points();
    }

    private calc_collision_points() {
        this.collision_points[0].x = this.x + Math.cos(this.angle + 0.59) * this.size * 0.601;
        this.collision_points[0].y = this.y + Math.sin(this.angle + 0.59) * this.size * 0.601;

        this.collision_points[1].x = this.x + Math.cos(this.angle + 2.55) * this.size * 0.601;
        this.collision_points[1].y = this.y + Math.sin(this.angle + 2.55) * this.size * 0.601;

        this.collision_points[2].x = this.x + Math.cos(this.angle + 3.73) * this.size * 0.601;
        this.collision_points[2].y = this.y + Math.sin(this.angle + 3.73) * this.size * 0.601;

        this.collision_points[3].x = this.x + Math.cos(this.angle + 5.69) * this.size * 0.601;
        this.collision_points[3].y = this.y + Math.sin(this.angle + 5.69) * this.size * 0.601;
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