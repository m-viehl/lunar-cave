type Config = {
    scale: number
    game: {
        time_factor: number
        g: number
        zoom: {
            speed_avg_window_size: number // TODO unit?
            min_zoom_factor: number
            max_zoom_factor: number
            min_speed: number
            max_speed: number
        }
        pbar: {
            x0: number
            width: number
            height: number
            background: number
            foreground: number
            border: number
            border_thickness: number
        }
        ship_model: string
    }
    cave: {
        style: {
            background: number
            foreground: number
            stroke_width: number
            stroke_col: number
            end_stroke_width: number
            end_col: number
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
}

export default Config;