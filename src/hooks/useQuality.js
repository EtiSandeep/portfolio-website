import { useMemo } from "react";

const query = (q) => typeof window !== "undefined" && window.matchMedia(q).matches;

/**
 * Picks a rendering budget once, at mount. Phones and reduced-motion visitors get a
 * calmer, cheaper world rather than a broken one.
 */
export function useQuality() {
    return useMemo(() => {
        if (typeof window === "undefined") {
            return { tier: "high", reducedMotion: false, dpr: [1, 2], particles: 2600, effects: true, motion: 1 };
        }

        const reducedMotion = query("(prefers-reduced-motion: reduce)");
        const coarse = query("(pointer: coarse)");
        const cores = navigator.hardwareConcurrency ?? 4;
        const memory = navigator.deviceMemory ?? 4;
        const narrow = window.innerWidth < 820;

        let tier = "high";
        if (coarse || narrow || cores <= 4 || memory <= 4) tier = "mid";
        if (cores <= 2 || memory <= 2) tier = "low";

        const byTier = {
            high: { dpr: [1, 1.9], particles: 2800, effects: true },
            mid: { dpr: [1, 1.5], particles: 1300, effects: true },
            low: { dpr: [0.8, 1.15], particles: 600, effects: false },
        }[tier];

        return {
            tier,
            reducedMotion,
            // Reduced motion keeps the world — it just stops it from breathing at you.
            motion: reducedMotion ? 0.12 : 1,
            ...byTier,
        };
    }, []);
}
