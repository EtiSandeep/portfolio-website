import { Color } from "three";

// Two skies. Every material in the world holds a reference to the *live* Color objects
// below, so PaletteDriver can crossfade day into night by mutating them in place — no
// material rebuilds, no React renders, and every set piece changes together.

export const THEMES = {
    // Drafting paper: a warm sheet under studio light. Linework is indigo, and anything
    // that has been *built* comes through in brass and graphite.
    sun: {
        hot: "#8C3A2E",        // revision red
        warm: "#A8712B",       // brass
        bright: "#BE8729",     // brass highlight
        accent: "#1F5FA8",     // draft blue
        deep: "#2A2A28",       // graphite
        fog: "#E4DDCB",
        background: "#EFEADC",
        horizon: "#DBD2BC",
        dust: "#8E9AA2",
        line: "#24466E",       // the linework itself
        rim: "#FFFFFF",
        lightIntensity: 2.2,
        ambientIntensity: 1.1,
        bloom: 0.26,
        threshold: 0.78,
    },
    // Cyanotype: the classic blueprint. Deep Prussian ground, cyan linework, and warm
    // brass where the drawing has resolved into matter.
    moon: {
        hot: "#E06A55",
        warm: "#C89B4E",
        bright: "#F0C978",
        accent: "#5AB6F0",
        deep: "#061224",
        fog: "#0B1F38",
        background: "#08182E",
        horizon: "#103055",
        dust: "#6E9BC4",
        line: "#8FD8FF",
        rim: "#EAF6FF",
        lightIntensity: 2.0,
        ambientIntensity: 0.5,
        bloom: 0.85,
        threshold: 0.45,
    },
};

const KEYS = ["hot", "warm", "bright", "accent", "deep", "fog", "background", "horizon", "dust", "line", "rim"];
const SCALARS = ["lightIntensity", "ambientIntensity", "bloom", "threshold"];

const makeLive = (theme) => {
    const live = {};
    KEYS.forEach((k) => {
        live[k] = new Color(theme[k]);
    });
    SCALARS.forEach((k) => {
        live[k] = theme[k];
    });
    return live;
};

/** Mutable, shared-by-reference palette. Read it, never replace it. */
export const palette = makeLive(THEMES.sun);

/** Moves `palette` a step toward the named theme. Called once per frame by PaletteDriver. */
export function stepPalette(themeName, alpha) {
    const target = THEMES[themeName] ?? THEMES.sun;
    KEYS.forEach((k) => {
        palette[k].lerp(TARGET_CACHE[themeName][k], alpha);
    });
    SCALARS.forEach((k) => {
        palette[k] += (target[k] - palette[k]) * alpha;
    });
}

/** Snaps the palette with no crossfade — used on first mount. */
export function snapPalette(themeName) {
    const target = THEMES[themeName] ?? THEMES.sun;
    KEYS.forEach((k) => palette[k].set(target[k]));
    SCALARS.forEach((k) => {
        palette[k] = target[k];
    });
}

const TARGET_CACHE = {
    sun: Object.fromEntries(KEYS.map((k) => [k, new Color(THEMES.sun[k])])),
    moon: Object.fromEntries(KEYS.map((k) => [k, new Color(THEMES.moon[k])])),
};
