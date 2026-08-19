/**
 * Seeded mulberry32. The world's scatter (dust, vortex) is generated from a fixed seed so
 * the layout is identical on every load — reproducible, and pure enough to run in render.
 */
export const makeRng = (seed) => {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};
