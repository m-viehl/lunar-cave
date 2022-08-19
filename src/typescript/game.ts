import { Cave } from "./cave/cave";
import { ShipState, Key } from "./misc";
import { Ship, Ship1 } from "./ship";
import { config, choose_config } from "./config/config_manager";
import { style, switch_style } from "./config/style_manager";

document.body.removeChild(document.getElementById("noscript-text")!);
// public variables
var canvas = document.getElementById("canvas") as HTMLCanvasElement;
var context: CanvasRenderingContext2D = canvas.getContext("2d")!;
var progresstext = document.getElementById("progress")!;

var start_time: number | undefined = undefined;
var t: number = 0; // seconds since start
var last_tick: number = 0;
var width: number;
var height: number;
var paused = true;

var game: Game;

// classes
enum GameState {
    gameover,
    won,
    ingame,
    init
}

class Game {
    private readonly lander: Ship;
    private cave: Cave;

    private dead = false;
    private is_current_cave_new = false;

    // required for running average for scale calculation
    private speed_sum: number;
    private last_speeds: number[];

    constructor() {
        this.lander = new Ship1(0, 0);
        this.read_settings();
        this.new_cave();
    }

    public logic(dt: number) {
        this.is_current_cave_new = false;
        dt *= config.game.time_factor;

        this.lander.tick(dt);
        // collision checks
        // This call with true is very important: it updates the current cave segment!
        this.cave.check_collision(this.lander, true);
        // we ignore the outcome (irrelevant) and perform extra collision checks for the ship edges instead.
        for (let p of this.lander.collision_points) {
            let state = this.cave.check_collision(p);
            switch (state) {
                case ShipState.end:
                    switch_layout(GameState.won);
                    this.freeze();
                    return;
                case ShipState.wall:
                    switch_layout(GameState.gameover);
                    this.freeze();
                    return;
            }
        }
    }

    private new_cave() {
        if (this.is_current_cave_new) // stop key event spam
            return;
        this.freeze();
        this.cave = new Cave(config.cave.generator.target_length);
        this.is_current_cave_new = true;
        switch_layout(GameState.init);
        this.reset_ship();
        draw();
    }

    private freeze() {
        paused = true;
        this.dead = true;
    }

    public reset_ship() {
        this.dead = false;

        this.lander.x = this.cave.spawn.x;
        this.lander.y = this.cave.spawn.y;
        this.lander.reset();

        this.speed_sum = 0;
        this.last_speeds = [];
        this.cave.reset();
        draw();
    }

    private key(e: KeyboardEvent, down: boolean) {
        if (this.dead && down && e.code != "KeyN") {
            this.reset_ship();
            return;
        }
        switch (e.code) {
            case "KeyN":
                this.new_cave();
                break;
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

    private scale_from_speed(v: number) {
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

    public draw() {
        // fill background
        context.fillStyle = style.cave.background;
        context.fillRect(0, 0, width, height);

        let scale_factor = this.scale_from_speed(this.lander.speed);

        let base_line_width = style.stroke_width * scale_factor;
        // this makes the line width constant, independent from scale!

        context.resetTransform();
        context.translate(
            (-this.lander.x) / scale_factor + width / 2,
            (-this.lander.y) / scale_factor + height / 2);
        context.scale(1 / scale_factor, 1 / scale_factor);
        // draw cave
        context.lineWidth = base_line_width;
        context.fillStyle = style.cave.foreground;
        context.strokeStyle = style.cave.stroke_col;

        this.cave.draw(context, {
            upper_left: { x: this.lander.x - width / 2 * scale_factor, y: this.lander.y - height / 2 * scale_factor },
            lower_right: { x: this.lander.x + width / 2 * scale_factor, y: this.lander.y + height / 2 * scale_factor }
        });
        // lander
        context.resetTransform();
        context.translate(width / 2, height / 2);
        context.rotate(this.lander.angle);
        context.scale(1 / scale_factor, 1 / scale_factor);

        // reset line style: changed by cave.draw for end line
        context.strokeStyle = "black";
        context.lineWidth = base_line_width;

        this.lander.draw(context);
        // set progress text
        progresstext.innerText = `${Math.round(Math.max(0, this.cave.progress * 100))}%`
    }

    public read_settings() {
        let difficulty_html = (document.getElementById("difficulty_selector") as HTMLSelectElement).value;
        if (difficulty_html != config.difficulty) {
            // difficulty changed
            choose_config(difficulty_html as "easy" | "hard");
            this.is_current_cave_new = false; // create a new cave even if we just generated one
            this.new_cave(); // cave proportions etc. may change
        }

        switch_style((document.getElementById("style_selector") as HTMLSelectElement).value);
        draw();
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
    if (paused)
        return;

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
    window.requestAnimationFrame(loop);
}

function unpause() {
    if (!paused)
        return;

    game.read_settings();

    switch_layout(GameState.ingame);
    paused = false;
    start_time = undefined;
    window.requestAnimationFrame(loop);
}

function switch_layout(gs: GameState) {
    let menu = document.getElementById("menu")!;
    if (gs == GameState.ingame) {
        menu.style.visibility = "hidden";
        document.body.style.cursor = "none";
        // show game info div, which is hidden before the first game
        document.getElementById("game_info")!.style.visibility = "inherit";
    } else {
        menu.style.visibility = "visible";
        document.body.style.cursor = "default";
        let game_mesg = document.getElementById("game_mesg")!;
        switch (gs) {
            case GameState.gameover:
                game_mesg.innerText = "Game over!";
                break;
            case GameState.won:
                game_mesg.innerText = "You won!";
                break;
            case GameState.init:
                // re-hide the message
                document.getElementById("game_info")!.style.visibility = "hidden";
        }
    }
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
    resized();

    // global variables are set

    game = new Game();
    draw();

    window.addEventListener("resize", resized);
    window.addEventListener("keydown", (e) => game.keydown(e));
    window.addEventListener("keyup", (e) => game.keyup(e));
    // loop is started when a key is pressed

    // make every HTML select element lose keyboard focus after its value has been changed
    // otherwise, the arrow keys will interfer with them when trying to play after changing
    for (let select of Array.from(document.getElementsByTagName("select"))) {
        select.addEventListener("change", () => select.blur());
    }
    // instantly apply style change
    let setting_changed_callback = () => {
        if (game !== undefined) {
            game.read_settings();
        }
    };
    // TODO use jQuery
    document.getElementById("style_selector")!.addEventListener("change", setting_changed_callback);
    document.getElementById("difficulty_selector")!.addEventListener("change", setting_changed_callback);
}

main();