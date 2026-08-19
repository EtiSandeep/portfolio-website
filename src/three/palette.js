import { Color } from "three";

// Two skies. Every material in the world holds a reference to the *live* Color objects
// below, so PaletteDriver can crossfade day into night by mutating them in place — no
// material rebuilds, no React renders, and every set piece changes together.

export const THEMES = {
    // Golden hour, not paper white: additive glow needs something to glow against, and a
    // warm mid-tone sky keeps the cream glass panels reading as lit glass.
    sun: {
        hot: "#E14D4D",
        warm: "#E5822B",
        bright: "#FFC24D",
        accent: "#E8697F",
        deep: "#71304A",
        fog: "#EFC6A3",
        background: "#FAEBD7",
        horizon: "#E3A57E",
        dust: "#C0603F",
        line: "#8F4536",
        rim: "#FFF6EA",
        lightIntensity: 2.4,
        ambientIntensity: 1.0,
        bloom: 0.34,
        threshold: 0.72,
    },
    moon: {
        hot: "#4B3B8C",     // moon-indigo
        warm: "#8B7FD9",    // moon-violet
        bright: "#F0D9A0",  // moon-glow
        accent: "#B7A8D1",
        deep: "#6B4E85",    // moon-plum
        fog: "#1E1338",
        background: "#140C24",
        horizon: "#2A1B4A",
        dust: "#C9B8F0",
        line: "#A091E4",
        rim: "#F3ECFB",
        lightIntensity: 2.0,
        ambientIntensity: 0.45,
        bloom: 0.85,
        threshold: 0.42,
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
