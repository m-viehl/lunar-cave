import { apply_functions } from "./config_manager";
import { config } from "./config_manager";

export type Style = {
    name: string
    stroke_width: number
    cave: {
        background: string
        foreground: string
        stroke_col: string
        end_line_width: number
        end_col: string
    }
    lander: {
        body_col: string
        stroke_col: string
        fire_col: string
    }
    text_col: string
    menu_background: string
}

import styles_json from "../../config/styles.json";
var styles = apply_functions(styles_json, config.scale);

export var style: Style;

export var available_style_names = Object.keys(styles);

export function switch_style(name: string) {
    style = styles[name];
    document.body.style.color = style.text_col;
    document.getElementById("menu")!.style.backgroundColor = style.menu_background;
    Array.from(document.getElementsByClassName("key")).forEach((e: HTMLElement) => {
        e.style.borderColor = style.text_col;
    })
}

const DEFAULT_STYLE = "filled_colors";
switch_style(DEFAULT_STYLE);