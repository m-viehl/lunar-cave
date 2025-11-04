export interface Point {
    x: number
    y: number
}

export interface PointPair {
    a: Point
    b: Point
}

export interface TickLog {
    dt: number
    thrust: boolean
    left: boolean
    right: boolean
}

// TICKLOG SERIALIZAZION

/**
 * Serializes a *single* ticklog to string
 * @param t the ticklog
 * @returns the serialized ticklog
 */
function serializeTickLog(t: TickLog): string {
    const flags =
        (t.left ? 'l' : '') +
        (t.right ? 'r' : '') +
        (t.thrust ? 't' : '')
    // dt is in seconds, we serialize it in milliseconds with 1µs precision
    const dtStr = (t.dt * 1000).toFixed(3)
    return `${flags},${dtStr}`
}

/**
 * Serializes a list of ticklogs to one string
 * @param ts The ticklogs
 * @returns The serialized ticklogs as string
 */
export function serializeTickLogs(ts: TickLog[]) {
    let a = ts.map(l => serializeTickLog(l))
    return a.join(";")
}

function deserializeTickLog(s: string): TickLog | null {
    const match = s.match(/^(l?r?t?),(\d+(?:\.\d{1,3})?)$/)
    if (!match) return null
    const [_, flags, dtStr] = match
    return {
        dt: parseFloat(dtStr!) / 1000, // back to seconds
        left: flags!.includes('l'),
        right: flags!.includes('r'),
        thrust: flags!.includes('t'),
    }
}

/**
 * Parses a ticklog serialization as produced by `serializeTickLogs`.
 * Returns null if the string is not properly formatted.
 * @param s the serialized ticklog string, separated with semicolons.
 * @returns the parsed list of ticklogs or null
 */
export function deserializeTickLogs(s: string): TickLog[] | null {
    let split = s.split(";");
    let parsed = split.map(deserializeTickLog);
    if (parsed.includes(null)) 
        return null;
    return parsed as TickLog[];
}
