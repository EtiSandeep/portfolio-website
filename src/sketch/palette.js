import { Color } from "three";
import { INK_THEMES, SURFACE_FOR } from "./inkColors";

/**
 * A live palette, mutated in place.
 *
 * Every material in the sketch world holds its own copy of its uniforms — the renderer
 * insists on that — so nothing can share a Color by reference. Instead each material calls
 * `syncInk` once a frame and the whole drawing crossfades from ink to chalk together, with
 * no material rebuilds and no React renders.
 */

const COLOR_KEYS = ["ground", "groundShade", "stroke", "strokeSoft", "accent", "accentWarm"];
const SCALAR_KEYS = ["keyLight"];

const build = (theme) => {
    const live = {};
    COLOR_KEYS.forEach((k) => {
        live[k] = new Color(theme[k]);
    });
    SCALAR_KEYS.forEach((k) => {
        live[k] = theme[k];
    });
    return live;
};

/** Read this, never replace it. */
export const ink = build(INK_THEMES.paper);

const TARGETS = {
    paper: Object.fromEntries(COLOR_KEYS.map((k) => [k, new Color(INK_THEMES.paper[k])])),
    slate: Object.fromEntries(COLOR_KEYS.map((k) => [k, new Color(INK_THEMES.slate[k])])),
};

const surfaceOf = (name) => SURFACE_FOR[name] ?? (INK_THEMES[name] ? name : "paper");

/** Moves the live palette a step toward a theme. Driven once per frame. */
export function stepInk(themeName, alpha) {
    const surface = surfaceOf(themeName);
    const target = INK_THEMES[surface];
    COLOR_KEYS.forEach((k) => ink[k].lerp(TARGETS[surface][k], alpha));
    SCALAR_KEYS.forEach((k) => {
        ink[k] += (target[k] - ink[k]) * alpha;
    });
}

/** Snaps with no crossfade — first mount, and after a tab has been hidden. */
export function snapInk(themeName) {
    const surface = surfaceOf(themeName);
    const target = INK_THEMES[surface];
    COLOR_KEYS.forEach((k) => ink[k].copy(TARGETS[surface][k]));
    SCALAR_KEYS.forEach((k) => {
        ink[k] = target[k];
    });
}

/**
 * Copies the live palette into whichever of the shared uniforms a material happens to
 * declare. Materials opt in simply by naming their uniforms this way.
 */
export function syncInk(uniforms) {
    if (!uniforms) return;
    if (uniforms.uPaper) uniforms.uPaper.value.copy(ink.ground);
    if (uniforms.uPaperShade) uniforms.uPaperShade.value.copy(ink.groundShade);
    if (uniforms.uInk) uniforms.uInk.value.copy(ink.stroke);
    if (uniforms.uInkSoft) uniforms.uInkSoft.value.copy(ink.strokeSoft);
    if (uniforms.uAccent) uniforms.uAccent.value.copy(ink.accent);
    if (uniforms.uAccentWarm) uniforms.uAccentWarm.value.copy(ink.accentWarm);
    if (uniforms.uKeyLight) uniforms.uKeyLight.value = ink.keyLight;
}

/** Starting values for a fresh set of uniforms, so nothing flashes before the first sync. */
export const inkUniforms = () => ({
    uInk: { value: ink.stroke.clone() },
    uPaper: { value: ink.ground.clone() },
    uPaperShade: { value: ink.groundShade.clone() },
    uAccent: { value: ink.accent.clone() },
    uKeyLight: { value: ink.keyLight },
});

export { INK_THEMES, SURFACE_FOR };
