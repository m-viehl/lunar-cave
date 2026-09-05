/**
 * An object that calls a given callback with a delta t argument periodically via
 * `window.requestAnimationFrame`. Can be started and stopped arbitrarily.
 * 
 * For testing, you may set target_fps to a non-null value, which will then be used.
 */

let paused = true
let last_tick_s: number | null = null
let callback: ((dt_s: number) => void) | undefined = undefined

// Only for testing! If null, window.requestAnimiationFrame will choose the framerate
let target_fps: number | null = null

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
    schedule_loop();
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
    schedule_loop();
}

function schedule_loop() {
    if (target_fps == null) {
        window.requestAnimationFrame(loop);
    } else {
        setTimeout(() => loop(Date.now()), 1000 / target_fps);
    }
}
