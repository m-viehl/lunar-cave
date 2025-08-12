/**
 * Manages keyboard events: Registers listeners (on first import) and updates the `key_state`
 * object which can be read from everywhere.
 * 
 * In addition, for certain keys, event listeners are run if set in the `key_listeners` object.
 */

export let key_state = {
    up: false,
    left: false,
    right: false,
}

interface Listeners {
    N: undefined | (() => void)
    any_control_key: undefined | (() => void)
}
// set listeners in this object if required
export let key_listeners: Listeners = {
    N: undefined,
    any_control_key: undefined
}

function on_key(e: KeyboardEvent, down: boolean) {
    // return if input should not trigger game unpause
    switch (e.code) {
        case "KeyN":
            if (key_listeners.N)
                key_listeners.N()
            break;
        case "KeyW":
        case "ArrowUp":
            key_state.up = down;
            if (key_listeners.any_control_key)
                key_listeners.any_control_key()
            break;
        case "KeyA":
        case "ArrowLeft":
            key_state.left = down;
            if (key_listeners.any_control_key)
                key_listeners.any_control_key()
            break;
        case "KeyD":
        case "ArrowRight":
            key_state.right = down;
            if (key_listeners.any_control_key)
                key_listeners.any_control_key()
            break;
    }
}

window.addEventListener("keydown", (e) => on_key(e, true));
window.addEventListener("keyup", (e) => on_key(e, false));