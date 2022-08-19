type Config = {
    scale: number
    difficulty: string
    game: {
        time_factor: number
        g: number
        zoom: {
            speed_avg_window_size: number //TODO X seconds at 60fps... this is ugly. Count fps!
            min_zoom_factor: number
            max_zoom_factor: number
            min_speed: number
            max_speed: number
        }
    }
    cave: {
        style: {
            background: string
            foreground: string
            stroke_width: number
            stroke_col: string
            end_line_width: number
            end_col: string
        }
        // help line style?
        generator: {
            constrain_to_go_right: boolean
            target_length: number
            spawn_segment_index: number
            min_angle_per_center: number
            max_angle_per_center: number
            min_segment_arc_length: number
            max_segment_arc_length: number
            min_cave_diameter: number
            max_cave_diameter: number
            min_radius: number
            max_radius: number
        }
    }
    ship: {
        size: number
        acc: number
        rotation_speed: number
        delta_thrust_factor_per_s: number
    }
}

export default Config;