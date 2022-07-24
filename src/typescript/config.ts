type color = string;
type scaled = number;

const SCALE = 20;

// unit calculations
function scaled(v: number) {
    return v * SCALE;
}

function deg2rad(deg: number) {
    return deg / 360 * 2 * Math.PI;
}

// copy for inheritance
function deepcopy(o: object): object {
    let out = {};
    for (let key in o) {
        let val = o[key];
        if (typeof val === "object") {
            out[key] = deepcopy(val);
        } else {
            out[key] = val;
        }
    }
    return out;
}

// definition
type Config = {
    game: {
        time_factor: number
        g: scaled
        zoom: {
            speed_avg_window_size: number // TODO unit?
            min_zoom_factor: number
            max_zoom_factor: number
            min_speed: scaled
            max_speed: scaled
            // different transition functions?
        }
        pbar: {
            x0: scaled
            width: scaled
            height: scaled
            background: color
            foreground: color
            border: color
            border_thickness: scaled
        }
        ship_model: string
    }
    cave: {
        style: {
            background: color
            foreground: color
            stroke_width: scaled
            stroke_col: color
            end_stroke_width: scaled
            end_col: color
        }
        // help line style?
        generator: {
            constrain_to_go_right: boolean
            target_length: scaled
            spawn_segment_index: number
            min_angle_per_center: number
            max_angle_per_center: number
            min_segment_arc_length: scaled
            max_segment_arc_length: scaled
            min_cave_diameter: scaled
            max_cave_diameter: scaled
            min_radius: scaled
            max_radius: scaled
        }
    }
}

// concrete settings
let standard_config: Config = {
    game: {
        time_factor: 1,
        g: 9.81,
        zoom: {
            speed_avg_window_size: 1.5 / 0.01667, // X / __ : X seconds at 60fps... this is ugly. Count fps!
            min_zoom_factor: 0.5,
            max_zoom_factor: 1.5,
            min_speed: 0,
            max_speed: scaled(30),
            // different transition functions?
        },
        pbar: {
            x0: scaled(20),
            width: scaled(30),
            height: scaled(5),
            background: "#d1d1d1",
            foreground: "#344745",
            border: "black",
            border_thickness: scaled(.5),
        },
        ship_model: "1",
    },
    cave: {
        style: {
            background: "#344745",
            foreground: "#d1d1d1",
            stroke_width: scaled(.1), // maybe absolute 2px?
            stroke_col: "black",
            end_stroke_width: scaled(.3),
            end_col: "#009955",
        },
        // help line style?
        generator: {
            constrain_to_go_right: true,
            target_length: scaled(350),
            spawn_segment_index: 5,
            min_angle_per_center: deg2rad(30),
            max_angle_per_center: deg2rad(120),
            // the following ones are multiplied by scale.
            min_segment_arc_length: scaled(.5),
            max_segment_arc_length: scaled(5),
            min_cave_diameter: scaled(2.5),
            max_cave_diameter: scaled(20),
            min_radius: scaled(10),
            max_radius: scaled(40),
        },
    }
}

let easy_config = deepcopy(standard_config) as Config;
easy_config.game.time_factor = 0.4;
easy_config.cave.generator.min_segment_arc_length *= 2;
easy_config.cave.generator.max_segment_arc_length *= 2;
easy_config.cave.generator.min_cave_diameter *= 2;
easy_config.cave.generator.max_cave_diameter *= 2;
easy_config.cave.generator.min_radius *= 2;
easy_config.cave.generator.max_radius *= 2;

export type { Config };
export { standard_config, easy_config };