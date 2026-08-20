import { palette } from "./palette";

const LIVE = {
    uWarm: "warm",
    uBright: "bright",
    uDeep: "deep",
    uRim: "rim",
    uAccent: "accent",
    uLine: "line",
    uFogColor: "fog",
    uHot: "hot",
    uDust: "dust",
    uHorizon: "horizon",
    uBackground: "background",
};

/**
 * Copies the live palette into a material's own uniform block.
 *
 * Materials do not keep the uniform object you hand them — the renderer takes its own copy,
 * Colors included. So a scene cannot rely on sharing Color instances with the palette to get
 * the day/night crossfade; each material has to be refreshed. This is a handful of copies
 * per frame across the whole world, which is nothing next to being unable to change theme.
 */
export function syncPaletteUniforms(uniforms) {
    if (!uniforms) return;
    for (const key in LIVE) {
        const uniform = uniforms[key];
        if (uniform && uniform.value && uniform.value.copy) uniform.value.copy(palette[LIVE[key]]);
    }
}
