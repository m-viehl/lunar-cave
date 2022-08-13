import lodash from "lodash";

type color = string;
type scaled = string;

/**
 * Applies special functions allowed in configuration jsons, which currently are:
 * - `scaled`: a string of the format `"scaled:XXX"` is converted to `scale * XXX`.
 * - `deg2rad`: a string of the format `"deg2rad:XXX"` is converted to `XXX (interpreted as number in degrees) in radians`
 * 
 * @param value an object. Functions are recursively applied to all matching string values.
 * @param scale the scale to use for the function `scale`.
 * @returns the object `value` with functions applied.
 */
function apply_functions(value: any, scale: number): any {
    if (typeof value === "string") {
        if (value.startsWith("scaled:")) {
            return parseFloat(value.substring(7)) * scale;
        }
        if (value.startsWith("deg2rad:")) {
            return parseFloat(value.substring(8)) / 360 * 2 * Math.PI;
        }
    } else if (typeof value === "object") {
        return lodash.mapValues(value, (value, key, object) => apply_functions(value, scale));
    } else {
        return value;
    }
}

/**
 * Combines multiple configuration objects to one by overwriting values in the ones with lower list index of `o` with
 * values from the ones with higher values. Does not perform any type checks, but throws an error if there is no base element
 * to overwrite.
 * @param configs A list of configuration objects in correct order for merging
 */
function jsons_to_config(base: object, ...to_apply: object[]): Config {
    let out = lodash.defaultsDeep(lodash.cloneDeep(base), to_apply);
    return apply_functions(out, (base as Config).scale) as Config;
}


// configuration type definition
type Config = {
    scale: number
    game: {
        time_factor: number
        g: scaled
        zoom: {
            speed_avg_window_size: number // TODO unit?
            min_zoom_factor: number
            max_zoom_factor: number
            min_speed: scaled
            max_speed: scaled
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

import base_config_json from "../static/base_config.json";
import easy_config_json from "../static/easy_config.json";

const hard_config = jsons_to_config([base_config_json]);
const easy_config = jsons_to_config([base_config_json, easy_config_json]);

export type { Config };
export { hard_config, easy_config };