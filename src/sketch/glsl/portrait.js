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
uniform sampler2D uMask;    // 1 where the figure is, 0 where the backdrop was
uniform float uHasMask;
uniform vec2 uTexel;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uAccent;
uniform float uScale;
uniform float uEdgeGain;
uniform float uReveal;      // 0..1, wipes the drawing on

varying vec2 vUv;

${inkCommon}

/**
 * A coarser hatch than the solids use.
 *
 * A figure only a few hundred pixels wide cannot carry four layers of cross-hatching — the
 * angles beat against each other and the whole thing turns into a dot screen. Three layers,
 * spaced half again as wide and drawn with a heavier nib, stay legible as strokes.
 */
float portraitTone(vec2 frag, float light, float scale) {
  float ink = 0.0;
  float sp = 11.0 * scale;

  if (light < 0.88) ink = max(ink, hatchLayer(frag, 0.68, sp, 1.5, 30.0) * smoothstep(0.88, 0.58, light));
  if (light < 0.52) ink = max(ink, hatchLayer(frag, -0.72, sp * 0.92, 1.6, 24.0) * smoothstep(0.52, 0.26, light));
  if (light < 0.20) ink = max(ink, hatchLayer(frag, 1.50, sp * 0.85, 1.7, 18.0) * smoothstep(0.20, 0.02, light));

  return clamp(ink, 0.0, 1.0);
}

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
  edge = smoothstep(0.14, 0.52, edge);

  // Stretch the photograph's own range across the range the hatching can draw. A studio
  // portrait uses very little of 0..1 — this one runs from a near-black shirt to skin and
  // light trousers — so mapping it straight through would leave everything in the darkest
  // tier, which is where hatching has the least to say.
  float tone = luma(uv);
  float ink = portraitTone(gl_FragCoord.xy, smoothstep(0.04, 0.74, tone), uScale);

  float coverage = clamp(max(ink * 0.94, edge), 0.0, 1.0);

  // Drop the backdrop so the figure sits on the paper rather than in a rectangle. The cut
  // comes from a mask flooded in from the frame edge; the luminance guess is only the
  // fallback for a photo the flood could not read.
  float cut = smoothstep(0.30, 0.68, texture2D(uMask, uv).r);
  float guess = max(1.0 - smoothstep(0.80, 0.94, tone), edge * 0.65);
  coverage *= mix(guess, cut, uHasMask);

  // Drawn on from the top down. uReveal runs 1 -> 0, so progress runs 0 -> 1, and the
  // overshoot guarantees the last band of the figure actually lands.
  float progress = (1.0 - uReveal) * 1.2;
  coverage *= 1.0 - smoothstep(progress - 0.16, progress + 0.02, 1.0 - vUv.y);

  if (coverage < 0.01) discard;
  gl_FragColor = vec4(mix(uPaper, uInk, coverage), coverage);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export { inkCommon };
