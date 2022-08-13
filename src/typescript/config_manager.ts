import lodash from "lodash";
import Config from "./config_type";
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
 * @param base The base config
 * @param to_apply Configuration objects which will be applied to base in the given order
 */
function jsons_to_config(base: object, ...to_apply: object[]): Config {
    let out = lodash.defaultsDeep(lodash.cloneDeep(base), to_apply);
    return apply_functions(out, (base as Config).scale) as Config;
}


import base_config_json from "../config/base_config.json";
import easy_config_json from "../config/easy_config.json";

const hard_config = jsons_to_config([base_config_json]);
const easy_config = jsons_to_config([base_config_json, easy_config_json]);

var config: Config;

function choose_config(name: "hard" | "easy") {
    switch (name) {
        case "easy":
            config = easy_config;
            break;
        case "hard":
            config = hard_config;
            break;
    }
}

export { config, choose_config };