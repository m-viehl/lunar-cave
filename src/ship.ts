import { Point, Key } from "./misc"

export interface Ship extends Point {
    collision_points: Point[];
    reset: () => void;
    tick: (dt: number) => void;
    draw: (context: CanvasRenderingContext2D) => void;
    key: (k: Key, down: boolean) => void;
}

export class Ship1 implements Ship {
    // state
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    thrust_factor = 0; // 1 = full thrust
    // controls: set these from outside! They are read in physics() to update position variables.
    rotation_thrust = 0; // -1 = full left, +1 = full right (TODO andersrum?)
    thrust: boolean;
    // settings
    g: number;
    delta_thrust_factor_per_s = 7;
    size = 1; // * scale
    acc = 3; // * g, maximum thruster acceleration
    rotation_speed = 180 /* degrees per second */ / 360 * 2 * Math.PI;
    collision_points: Point[];

    constructor(x: number, y: number, scale: number, g: number) {
        this.size *= scale;
        this.g = g;
        this.acc *= g;
        this.x = x;
        this.y = y;
        this.reset();
        this.collision_points = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]
        this.calc_collision_points();
    }

    public key(k: Key, down: boolean) {
        switch (k) {
            case Key.boost:
                this.thrust = down;
                break;
            case Key.left:
                this.rotation_thrust = down ? -1 : 0;
                break;
            case Key.right:
                this.rotation_thrust = down ? +1 : 0;
                break;

        }
    }

    public reset() {
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.thrust_factor = 0;
        this.thrust = false;
        this.rotation_thrust = 0;
    }

    public draw(context: CanvasRenderingContext2D) {
        // TODO WARNING: this depends on the translation done before in game.ts!
        // unify the context translations, zoom etc.!
        context.translate(this.x, this.y);
        context.rotate(this.angle);
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
        let ay = - this.thrust_factor * this.acc * Math.sin(this.angle + Math.PI / 2) + this.g;
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