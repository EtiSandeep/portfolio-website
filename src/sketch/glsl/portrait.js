import { inkCommon } from "./ink";

/**
 * Turns a photograph into a drawing, in the same ink language as the rest of the scene.
 *
 * Sobel across the luminance channel finds the contours and inks them; the remaining tone is
 * built up with the shared cross-hatching. Doing it in a shader rather than pre-baking a PNG
 * means the strokes match the objects around it and stay crisp at any size.
 */
export const portraitVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const portraitFragment = /* glsl */ `
uniform sampler2D uPhoto;
uniform vec2 uTexel;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uAccent;
uniform float uScale;
uniform float uEdgeGain;
uniform float uReveal;      // 0..1, wipes the drawing on

varying vec2 vUv;

${inkCommon}

float luma(vec2 uv) {
  vec3 c = texture2D(uPhoto, uv).rgb;
  return dot(c, vec3(0.299, 0.587, 0.114));
}

void main() {
  // Nudge the sample point so contours are never perfectly straight.
  vec2 uv = vUv + (vec2(valueNoise(vUv * 90.0), valueNoise(vUv * 90.0 + 17.0)) - 0.5) * uTexel * 1.6;

  vec4 src = texture2D(uPhoto, uv);

  // Sobel over luminance -> contour lines.
  float tl = luma(uv + uTexel * vec2(-1.0, 1.0));
  float t  = luma(uv + uTexel * vec2( 0.0, 1.0));
  float tr = luma(uv + uTexel * vec2( 1.0, 1.0));
  float l  = luma(uv + uTexel * vec2(-1.0, 0.0));
  float r  = luma(uv + uTexel * vec2( 1.0, 0.0));
  float bl = luma(uv + uTexel * vec2(-1.0,-1.0));
  float b  = luma(uv + uTexel * vec2( 0.0,-1.0));
  float br = luma(uv + uTexel * vec2( 1.0,-1.0));

  float gx = -tl - 2.0 * l - bl + tr + 2.0 * r + br;
  float gy =  tl + 2.0 * t + tr - bl - 2.0 * b - br;
  float edge = clamp(length(vec2(gx, gy)) * uEdgeGain, 0.0, 1.0);
  edge = smoothstep(0.22, 0.62, edge);

  // Tone, hatched the same way the 3D objects are.
  float tone = luma(uv);
  float ink = hatchTone(gl_FragCoord.xy, smoothstep(0.05, 0.95, tone), uScale);

  float coverage = clamp(max(ink * 0.92, edge), 0.0, 1.0);

  // The photo's own background is near-white; drop it so the figure sits on the paper
  // rather than in a rectangle.
  float subject = 1.0 - smoothstep(0.80, 0.94, tone);
  coverage *= max(subject, edge * 0.65);

  // Drawn on from the top down.
  float wipe = smoothstep(uReveal - 0.18, uReveal + 0.06, 1.0 - vUv.y);
  coverage *= 1.0 - wipe;

  // A touch of the accent in the darkest passages keeps it from reading as pure greyscale.
  vec3 stroke = mix(uInk, uAccent, smoothstep(0.55, 1.0, ink) * 0.35);

  if (coverage < 0.01) discard;
  gl_FragColor = vec4(mix(uPaper, stroke, coverage), coverage);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export { inkCommon };
