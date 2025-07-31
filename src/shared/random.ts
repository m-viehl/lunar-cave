/**
 * Get a random generator function using a given seed.
 * The returned function returns pseudo-random numbers between 0 and 1.
 * 
 * This uses the mulberry32 algorithm. Taken from:
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 * 
 * @param a the random seed
 */
export function randomize_mulberry32(a: number): () => number {
    let out = function () {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    // discard first 10 numbers for initialization
    for (let i = 0; i < 10; i++) {
        out();
    }
    return out;
}
