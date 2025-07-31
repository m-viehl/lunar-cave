import { Point } from "./misc";

const SCALE = 20;
const deg2rad = 2 * 3.141592 / 360;
let config = {
    "acc": SCALE * 30,
    "size": SCALE * 1,
    "rotation_speed": deg2rad * 180,
    "delta_thrust_factor_per_s": 7,
    "g": SCALE * 9.81,
}


export class Ship {
    // state variables (are initialized in this.reset)
    x!: number;
    y!: number;
    vx!: number;
    vy!: number;
    angle!: number;
    thrust_factor = 0; // actual thrust level, which has some inertia!
    speed!: number;

    spawn: Point;

    collision_points: Point[];

    constructor(spawn: Point) {
        this.spawn = spawn;
        this.collision_points = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
        this.reset();
    }

    public reset() {
        this.x = this.spawn.x;
        this.y = this.spawn.y;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.thrust_factor = 0;
        this.speed = 0;
        this.calc_collision_points();
    }

    /**
     * Update the ship's state by a discrete time step
     * 
     * @param dt time step length
     * @param thrust whether thrust input is active
     * @param turn_left whether turn left input is active
     * @param turn_right whether turn right input is active
     */
    public tick(dt: number, thrust: boolean, turn_left: boolean, turn_right: boolean) {

        // calculate thrust level
        if (thrust) {
            this.thrust_factor += config.delta_thrust_factor_per_s * dt;
            this.thrust_factor = Math.min(this.thrust_factor, 1);
        } else {
            this.thrust_factor -= config.delta_thrust_factor_per_s * dt;
            this.thrust_factor = Math.max(this.thrust_factor, 0);
        }

        // rotation
        let rotation_thrust = 0;
        if (!(turn_left && turn_right)) {
            if (turn_left)
                rotation_thrust = -1
            else
                rotation_thrust = +1
        }
        this.angle += config.rotation_speed * rotation_thrust * dt;
        // calc acceleration
        let ax = - this.thrust_factor * config.acc * Math.cos(this.angle + Math.PI / 2);
        let ay = - this.thrust_factor * config.acc * Math.sin(this.angle + Math.PI / 2) + config.g;
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
        this.collision_points[0].x = this.x + Math.cos(this.angle + 0.59) * config.size * 0.601;
        this.collision_points[0].y = this.y + Math.sin(this.angle + 0.59) * config.size * 0.601;

        this.collision_points[1].x = this.x + Math.cos(this.angle + 2.55) * config.size * 0.601;
        this.collision_points[1].y = this.y + Math.sin(this.angle + 2.55) * config.size * 0.601;

        this.collision_points[2].x = this.x + Math.cos(this.angle + 3.73) * config.size * 0.601;
        this.collision_points[2].y = this.y + Math.sin(this.angle + 3.73) * config.size * 0.601;

        this.collision_points[3].x = this.x + Math.cos(this.angle + 5.69) * config.size * 0.601;
        this.collision_points[3].y = this.y + Math.sin(this.angle + 5.69) * config.size * 0.601;
    }
}