// None of the materials in this world are built on three's lambert/standard shaders, so
// they get no fog from `scene.fog`. These chunks give them their own, which is what keeps a
// far-off set piece from punching a hard silhouette through the sky.

export const fogVarying = /* glsl */ `
varying float vFogDepth;
`;

export const fogHelper = /* glsl */ `
uniform vec3 uFogColor;
uniform float uFogDensity;
varying float vFogDepth;

float fogAmount() {
  float d = uFogDensity * vFogDepth;
  return clamp(1.0 - exp(-d * d), 0.0, 1.0);
}
`;

/** Opaque / alpha-blended surfaces fade toward the sky colour. */
export const fogMix = /* glsl */ `col = mix(col, uFogColor, fogAmount());`;

/** Additive glows have to fade out instead — mixing would make them brighten the fog. */
export const fogFade = /* glsl */ `alpha *= 1.0 - fogAmount();`;
