import { Point, Key } from "./misc"

export interface Ship extends Point {
    collision_points: Point[];
    reset: () => void;
    tick: (dt: number) => void;
    draw: (context: CanvasRenderingContext2D) => void;
    key: (k: Key, down: boolean) => void;
    speed: number;
    x: number;
    y: number;
    angle: number;
}

export class Ship1 implements Ship {
    // state
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    thrust_factor = 0; // 1 = full thrust
    speed: number;
    // controls
    rotation_thrust = 0; // -1 = full left, +1 = full right
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
        this.speed = 0;
    }

    public draw(context: CanvasRenderingContext2D) {
        // TODO WARNING: this depends on the translation done before in game.ts!
        // unify the context translations, zoom etc.!
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
        context.fillStyle = "#5c5e5e";
        context.fillRect(-this.size / 2, -this.size / 3, this.size, this.size * 2 / 3);
    }

    public tick(dt: number) {
        // variable thrust
        if (this.thrust) {
            this.thrust_factor += this.delta_thrust_factor_per_s * dt;
            this.thrust_factor = Math.min(this.thrust_factor, 1);
        } else {
            this.thrust_factor -= this.delta_thrust_factor_per_s * dt;
            this.thrust_factor = Math.max(this.thrust_factor, 0);
        }
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
        this.speed = Math.hypot(this.vx, this.vy);

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


export class Ship2 implements Ship {
    // state
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    angle: number;
    v_angle: number;
    thrust_factor_left = 0; // 1 = full thrust
    thrust_factor_right = 0;
    // controls
    thrust_left: boolean;
    thrust_right: boolean;
    // settings
    g: number;
    delta_thrust_factor_per_s = 7;
    acc = 1; // * g, maximum single thruster acceleration
    collision_points: Point[];
    rotation_dampening_factor = 0.99;
    // geometry/drawing/collision detection
    r_x = 1; // * scale
    r_y = 0.4; // * scale
    alpha: number;
    r_edge: number;
    rotation_acc_factor: number;


    constructor(x: number, y: number, scale: number, g: number) {
        this.g = g;
        this.acc *= g;

        this.r_x *= scale;
        this.r_y *= scale;
        
        this.alpha = Math.atan(this.r_y / this.r_x);
        this.r_edge = Math.hypot(this.r_x, this.r_y);
        this.rotation_acc_factor = 6 * this.acc * this.r_x / (this.r_x ** 2 + this.r_y ** 2) * 2 * Math.PI;
        // real physics is not playable: way too much torque. Artificially reducing angular acceleration.
        this.rotation_acc_factor *= 0.03;

        this.x = x;
        this.y = y;
        this.reset();

        this.collision_points = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]
        this.calc_collision_points();
    }

    public key(k: Key, down: boolean) {
        switch (k) {
            case Key.left:
                this.thrust_left = down;
                break;
            case Key.right:
                this.thrust_right = down;
                break;
        }
    }

    public reset() {
        this.vx = 0;
        this.vy = 0;
        this.speed = 0;
        this.angle = 0;
        this.v_angle = 0;
        this.thrust_factor_left = 0;
        this.thrust_factor_right = 0;
        this.thrust_left = false;
        this.thrust_right = false;
    }

    public draw(context: CanvasRenderingContext2D) {
        // TODO WARNING: this depends on the translation done before in game.ts!
        // unify the context translations, zoom etc.!
        context.fillStyle = "#5c5e5e"
        context.fillRect(-this.r_x, -this.r_y, 2 * this.r_x, 2 * this.r_y);
        // thruster
        // TODO
    }

    public tick(dt: number) {
        this.thrust_factor_left = this.thrust_left ? 1 : 0;
        this.thrust_factor_right = this.thrust_right ? 1 : 0;
        // physics
        // left thruster
        let ax = 0;
        let ay = this.g;
        let a_angle = 0;
        // calc accelerations
        if (this.thrust_factor_left > 0) {
            ax -= this.thrust_factor_left * this.acc * Math.cos(this.angle + Math.PI / 2);
            ay -= this.thrust_factor_left * this.acc * Math.sin(this.angle + Math.PI / 2);
            a_angle += this.thrust_factor_left * this.rotation_acc_factor;
        }
        if (this.thrust_factor_right > 0) {
            ax -= this.thrust_factor_right * this.acc * Math.cos(this.angle + Math.PI / 2);
            ay -= this.thrust_factor_right * this.acc * Math.sin(this.angle + Math.PI / 2);
            a_angle -= this.thrust_factor_right * this.rotation_acc_factor;
        }
        // apply accelerations
        this.vx += ax * dt;
        this.vy += ay * dt;
        this.speed = Math.hypot(this.vx, this.vy);
        this.v_angle += a_angle * dt;
        // dampening
        this.v_angle *= this.rotation_dampening_factor;
        // apply velocities
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.angle += this.v_angle * dt;

        this.calc_collision_points();
    }

    private calc_collision_points() {
        this.collision_points[0].x = this.x + Math.cos(this.angle + this.alpha) * this.r_edge;
        this.collision_points[0].y = this.y + Math.sin(this.angle + this.alpha) * this.r_edge;

        this.collision_points[1].x = this.x + Math.cos(this.angle + Math.PI - this.alpha) * this.r_edge;
        this.collision_points[1].y = this.y + Math.sin(this.angle + Math.PI - this.alpha) * this.r_edge;

        this.collision_points[2].x = this.x + Math.cos(this.angle + Math.PI + this.alpha) * this.r_edge;
        this.collision_points[2].y = this.y + Math.sin(this.angle + Math.PI + this.alpha) * this.r_edge;

        this.collision_points[3].y = this.y + Math.sin(this.angle - this.alpha) * this.r_edge;
        this.collision_points[3].x = this.x + Math.cos(this.angle - this.alpha) * this.r_edge;
    }
}
