
const deg2rad = 2 * 3.141592 / 360;


/**
 * Interface that contains all parameters the user can manually change in some way.
 * In `shared/config.ts`, this should then be used to derive the full config object. (TODO!)
 */
export interface GameConfig {
    time_factor: number
    scale: number  // default: 20
    length: number
    seed: number
}


/**
 * Obtain a full config object based on a game config.
 * Contains both frontend and backend related configs.
 */
export function set_config(game_config: GameConfig) {
    let SCALE = game_config.scale

    return {
        ship_config: {
            "acc": SCALE * 30,
            "size": SCALE * 1,
            "rotation_speed": deg2rad * 180,
            "delta_thrust_factor_per_s": 7,
            "g": SCALE * 9.81,
            time_factor: game_config.time_factor,
        },

        zoom_config: {
            speed_smoothing_factor: 0.02, // TODO anpassen!
            "min_zoom_factor": 0.5,
            "max_zoom_factor": 1.5,
            "min_speed": 0,
            "max_speed": SCALE * 30
        },

        draw_config: {
            "cave": {
                "background": "#344745",
                "foreground": "#d1d1d1",
                "end_col": "#009955"
            },
            "lander": {
                "body_col": "#5c5e5e",
                "fire_col": "#02e5ca"
            },
            "text_col": "black",
            "menu_background": "rgba(255, 255, 255, 0.25)"
        },

        legacy_cave_config: {
            constrain_to_go_right: true,
            target_length: SCALE * 350,
            spawn_segment_index: 5,
            min_angle_per_center: deg2rad * 30,
            max_angle_per_center: deg2rad * 120,
            min_segment_arc_length: SCALE * .5,
            max_segment_arc_length: SCALE * 5,
            min_cave_diameter: SCALE * 2.5,
            max_cave_diameter: SCALE * 20,
            min_radius: SCALE * 10,
            max_radius: SCALE * 40,
            arc_length: SCALE * game_config.length,
            seed: game_config.seed,
        }
    }

}

// infer the type from set_config, such that it can be used in the code without repeating it as interface
export type ConfigType = ReturnType<typeof set_config>
