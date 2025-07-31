const DEFAULT_SCALE = 20;
const deg2rad = 2 * 3.14159265 / 360;

export interface LegacyCaveConfig {
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
    arc_length: number
    seed: number
}

export function get_legacy_config(
    length: number,
    seed: number,
    scale_factor: number,
): LegacyCaveConfig {
    let SCALE = scale_factor * DEFAULT_SCALE
    return {
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
        arc_length: SCALE * length,
        seed: seed,
    }
}