
const deg2rad = 2 * 3.141592 / 360;


/**
 * Interface that contains all parameters the user can manually change in some way.
 */
export interface GameConfig {
    time_factor: number
    ship_scale: number  // default: 20
    cave_scale: number
    length: number
    seed: number
}


/**
 * Obtain a full config object based on a game config.
 * Contains both frontend and backend related configs.
 */
export function get_config(game_config: GameConfig) {
    return {
        ship_config: {
            "acc": game_config.ship_scale * 30,
            "size": game_config.ship_scale * 1,
            "rotation_speed": deg2rad * 180,
            "delta_thrust_factor_per_s": 7,
            "g": game_config.ship_scale * 9.81,
            time_factor: game_config.time_factor,
        },

        zoom_config: {
            speed_smoothing_factor: 0.02, // TODO anpassen!
            "min_zoom_factor": 0.5,
            "max_zoom_factor": 1.5,
            "min_speed": 0,
            "max_speed": game_config.ship_scale * 30
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
            target_length: game_config.cave_scale * 350,
            spawn_segment_index: 5,
            min_angle_per_center: deg2rad * 30,
            max_angle_per_center: deg2rad * 120,
            min_segment_arc_length: game_config.cave_scale * .5,
            max_segment_arc_length: game_config.cave_scale * 5,
            min_cave_diameter: game_config.cave_scale * 2.5,
            max_cave_diameter: game_config.cave_scale * 20,
            min_radius: game_config.cave_scale * 10,
            max_radius: game_config.cave_scale * 40,
            arc_length: game_config.cave_scale * game_config.length,
            seed: game_config.seed,
        }
    }

}

// infer the type from set_config, such that it can be used in the code without repeating it as interface
export type ConfigType = ReturnType<typeof get_config>
