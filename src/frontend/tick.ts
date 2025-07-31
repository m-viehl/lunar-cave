/**
 * An object that calls a given callback with a delta t argument periodically via
 * `window.requestAnimationFrame`. Can be started and stopped arbitrarily.
 */
class Tick {

    private paused = false
    private last_tick: number | null = null
    private callback: (dt: number) => void

    constructor(callback: (dt: number) => void) {
        this.callback = callback
    }

    /**
     * Starts ticking.
     * May be called arbitrarily often while running.
     */
    public start() {
        this.paused = false
        this.loop()
    }

    /**
     * Stops immediately, no future tick will be executed.
     */
    public stop() {
        this.paused = true
        this.last_tick = null
    }

    private loop(now: number = 0) {
        if (this.paused)
            return;

        now /= 1000; // convert to seconds
        if (this.last_tick === null) {
            // 1st run
            this.last_tick = now;
        } else {
            // normal tick
            let dt = now - this.last_tick;
            this.last_tick = now;

            this.callback(dt);
        }
        window.requestAnimationFrame(() => this.loop());
    }
}