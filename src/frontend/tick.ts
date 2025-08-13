/**
 * An object that calls a given callback with a delta t argument periodically via
 * `window.requestAnimationFrame`. Can be started and stopped arbitrarily.
 */

let paused = true
let last_tick: number | null = null
let callback: ((dt: number) => void) | undefined = undefined

export function set_callback(fct: (dt: number) => void) {
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
    last_tick = null
    window.requestAnimationFrame(loop)
}

/**
 * Stops immediately, no future tick will be executed.
 */
export function stop() {
    paused = true
}

function loop(now: number = -1000) {
    if (paused)
        return

    now /= 1000 // convert to seconds
    if (last_tick === null) {
        // 1st run
        last_tick = now;
    } else {
        // normal tick
        let dt = now - last_tick;
        last_tick = now;
        
        if (callback)
            callback(dt);
    }
    window.requestAnimationFrame((t) => loop(t));
}
