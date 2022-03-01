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
    terrain: Terrain;

    constructor() {
        this.reset();
    }

    public logic(dt: number) {
        this.lander.physics(dt);
        // map borders
        if (this.lander.x < 0) {
            this.lander.vx = 0;
            this.lander.x = 0;
        }
        if (this.lander.x > width) {
            this.lander.vx = 0;
            this.lander.x = width;
        }
        // terrain collision
        let collision_info = this.terrain.collision(this.lander);
        if (collision_info != null) {
            if (!collision_info.is_landing_site) {
                this.reset();
            } else {
                this.lander.vx = 0;
                this.lander.vy = 0;
                this.lander.y = collision_info.y_reset;
            }
        }
    }

    public reset() {
        this.terrain = new Terrain();
        this.lander = new Lander(width * 0.1 + Math.random() * width * 0.8, height * 0.1);
        draw();
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
        this.terrain.draw();
        this.lander.draw();
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
        context.resetTransform();
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        // draw body
        context.strokeRect(-this.size / 2, -this.size / 3, this.size, this.size * 2 / 3);
        // draw thruster flame
        if (this.thrust > 0) {
            context.beginPath();
            context.moveTo(-this.size / 3, this.size / 3);
            context.lineTo(0, this.size * (1 + 1 / 3) * this.thrust);
            context.lineTo(+this.size / 3, this.size / 3);
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

type Point = { x: number, y: number };
type CollisionInfo = {
    is_landing_site: boolean;
    y_reset: number;
};

class Terrain {
    points: Point[];
    landing_site_indices: number[]; // contain indices of the *left* points of each landing site

    // settings
    readonly min_segment_width = 1.5 * scale;
    readonly max_segment_width = 4 * scale;
    readonly max_y_diff = 5 * scale;
    readonly terrain_min_y = height / 2;
    readonly terrain_max_y = height * 0.95;
    readonly landing_area_count = 3;

    constructor() {
        this.points = [];
        let current_x = 0;
        // make terrain
        while (current_x < width) {
            if (this.points.length !== 0) {
                current_x += this.min_segment_width + Math.random() * (this.max_segment_width - this.min_segment_width);
            }
            let y_new = this.terrain_min_y + Math.random() * (this.terrain_max_y - this.terrain_min_y);
            this.points.push({ x: current_x, y: y_new });
        }
        // create landing areas
        this.landing_site_indices = [];
        let landing_site_possibilities: number[] = [];
        for (let i = 1; i < this.points.length - 2; i++) {
            landing_site_possibilities.push(i);
        }
        for (let j = 0; j < this.landing_area_count; j++) {
            if (landing_site_possibilities.length == 0)
                break; // no more sites available
            let i = Math.trunc(Math.random() * landing_site_possibilities.length);
            let pos = landing_site_possibilities[i]; // index in this.points
            this.landing_site_indices.push(pos);
            // update possibilities
            for (let remove_pos = pos - 1; remove_pos <= pos + 1; remove_pos++) {
                let index_in_lsp = landing_site_possibilities.indexOf(remove_pos);
                if (index_in_lsp !== -1) {
                    landing_site_possibilities.splice(index_in_lsp, 1);
                }
            }
            // make zone flat
            this.points[pos + 1].y = this.points[pos].y;
        }
    }

    public draw() {
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            context.lineTo(this.points[i].x, this.points[i].y);
            // TODO mark landing sites?
        }
        context.stroke();
    }

    public collision(p: Point): CollisionInfo | null {
        // returns null if no collision. If collision, returns the y position to reset the ship to.
        if (p.x < 0 || p.x > width)
            throw Error("out of terrain");
        for (let i = 0; i < this.points.length - 1; i++) {
            let a = this.points[i];
            let b = this.points[i + 1];
            if (a.x <= p.x && b.x > p.x) {
                let delta_y = b.y - a.y;
                let delta_x = b.x - a.x;
                let y_hill = a.y + delta_y * ((p.x - a.x) / delta_x);
                if (p.y > y_hill) {
                    return {
                        is_landing_site: this.landing_site_indices.includes(i),
                        y_reset: y_hill
                    }
                }
                return null;
            }
        }
        throw Error("out of terrain");
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
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    if (game !== undefined) {
        game.reset();
    }
}

function main() {
    document.body.removeChild(document.getElementById("noscript-text")!);
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    context = canvas.getContext("2d")!
    resized();
    // global variables are set

    game = new Game();
    game.draw();

    window.addEventListener("resize", resized);
    window.addEventListener("keydown", (e) => game.keydown(e));
    window.addEventListener("keyup", (e) => game.keyup(e));
    // loop is started when a key is pressed
}
