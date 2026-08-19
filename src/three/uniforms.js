import { Vector2 } from "three";
import { palette } from "./palette";

/** Matches the reach of the camera route: neighbouring stations haze, far ones vanish. */
export const FOG_DENSITY = 0.03;

/**
 * Uniform block wired straight to the live palette Colors. Because the uniform holds the
 * same object the crossfade mutates, every material follows day/night for free.
 */
export const paletteUniforms = () => ({
    uHot: { value: palette.hot },
    uWarm: { value: palette.warm },
    uBright: { value: palette.bright },
    uAccent: { value: palette.accent },
    uDeep: { value: palette.deep },
    uRim: { value: palette.rim },
    uDust: { value: palette.dust },
    uLine: { value: palette.line },
    uHorizon: { value: palette.horizon },
    uBackground: { value: palette.background },
});

export const baseUniforms = () => ({
    uTime: { value: 0 },
    uFogColor: { value: palette.fog },
    uFogDensity: { value: FOG_DENSITY },
    uPointer: { value: new Vector2(0, 0) },
    uEnergy: { value: 0 },
    ...paletteUniforms(),
});

/** Shared fragment tail: iridescent cosine ramp + the three.js output chunks. */
export const iridescence = /* glsl */ `
vec3 iridescent(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}
`;

export const outputChunks = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
`;
