/**
 * Manages keyboard events: Registers listeners (on first import) and updates the `key_state`
 * object which can be read from everywhere.
 */

export let key_state = {
    up: false,
    left: false,
    right: false,
}

function on_key(e: KeyboardEvent, down: boolean) {
    // return if input should not trigger game unpause
    switch (e.code) {
        case "KeyW":
        case "ArrowUp":
            key_state.up = down;
            break;
        case "KeyA":
        case "ArrowLeft":
            key_state.left = down;
            break;
        case "KeyD":
        case "ArrowRight":
            key_state.right = down;
            break;
    }
}

window.addEventListener("keydown", (e) => on_key(e, true));
window.addEventListener("keyup", (e) => on_key(e, false));