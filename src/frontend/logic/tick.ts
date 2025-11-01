/**
 * An object that calls a given callback with a delta t argument periodically via
 * `window.requestAnimationFrame`. Can be started and stopped arbitrarily.
 */

let paused = true
let last_tick_s: number | null = null
let callback: ((dt_s: number) => void) | undefined = undefined

/**
 * Sets the callback function to be called periodically.
 * @param fct The callback function to be called. It will be called with the delta t in seconds.
 */
export function set_callback(fct: (dt_s: number) => void) {
    callback = fct
}

/**
 * Starts ticking.
 * May be called arbitrarily often while running.
 */
export function start() {
    if (!paused)
        return
    paused = false
    last_tick_s = null
    window.requestAnimationFrame(loop)
}

/**
 * Stops immediately, no future tick will be executed.
 */
export function stop() {
    paused = true
}

function loop(now_ms: number = -1000) {
    if (paused)
        return

    let now_s = now_ms / 1000 // convert to seconds
    if (last_tick_s === null) {
        // 1st run
        last_tick_s = now_s;
    } else {
        // normal tick
        let dt_s = now_s - last_tick_s;
        last_tick_s = now_s;

        if (callback)
            callback(dt_s);
    }
    window.requestAnimationFrame((t) => loop(t));
}
