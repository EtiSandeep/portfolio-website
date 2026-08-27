/**
 * Pen-and-ink rendering.
 *
 * Two ideas do all the work. Tone is drawn as cross-hatching in screen space — as a surface
 * turns away from the light, more layers of hatching cut in, the way you would build up
 * shadow with a pen. And every line is displaced by a little noise so nothing reads as a
 * machine-drawn edge.
 */

export const inkCommon = /* glsl */ `
// Cheap value noise. Used to wobble lines rather than to shade anything, so it does not
// need to be smooth or expensive.
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

/**
 * One layer of hatching. Returns 1 on a stroke and 0 between strokes.
 * wobble bends the ruling so the strokes drift the way a hand would.
 */
float hatchLayer(vec2 frag, float angle, float spacing, float weight, float wobble) {
  float s = sin(angle), c = cos(angle);
  vec2 r = vec2(frag.x * c - frag.y * s, frag.x * s + frag.y * c);

  // Bend the line, and vary its thickness along its length, so strokes taper.
  r.y += (valueNoise(r * 0.012) - 0.5) * wobble;
  float thickness = weight * (0.72 + 0.56 * valueNoise(r.yx * 0.05));

  float d = abs(fract(r.y / spacing) - 0.5) * spacing;
  return 1.0 - smoothstep(thickness * 0.5, thickness * 0.5 + 0.9, d);
}

/**
 * Builds up tone from light (1 = lit, 0 = dark) using progressively more hatch layers.
 * Returns ink coverage in 0..1.
 */
float hatchTone(vec2 frag, float light, float scale) {
  float ink = 0.0;
  float sp = 7.0 * scale;

  if (light < 0.92) ink = max(ink, hatchLayer(frag, 0.72, sp, 1.15, 26.0) * smoothstep(0.92, 0.72, light));
  if (light < 0.68) ink = max(ink, hatchLayer(frag, -0.68, sp * 0.94, 1.2, 22.0) * smoothstep(0.68, 0.48, light));
  if (light < 0.44) ink = max(ink, hatchLayer(frag, 1.48, sp * 0.86, 1.25, 18.0) * smoothstep(0.44, 0.26, light));
  if (light < 0.22) ink = max(ink, hatchLayer(frag, 0.12, sp * 0.78, 1.35, 14.0) * smoothstep(0.22, 0.04, light));

  return clamp(ink, 0.0, 1.0);
}
`;

/** Inverted-hull outline: the same mesh, pushed out along its normals and drawn inside-out. */
export const outlineVertex = /* glsl */ `
uniform float uThickness;
uniform float uTime;

${inkCommon}

void main() {
  // Vary the swell along the silhouette so the contour breathes like a drawn line.
  float jitter = 0.78 + 0.44 * valueNoise(position.xy * 2.4 + uTime * 0.05);
  vec3 swollen = position + normal * uThickness * jitter;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(swollen, 1.0);
}
`;

export const outlineFragment = /* glsl */ `
uniform vec3 uInk;
void main() {
  gl_FragColor = vec4(uInk, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const hatchVertex = /* glsl */ `
varying vec3 vNormalV;
varying vec3 vViewDir;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormalV = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

export const hatchFragment = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uAccent;
uniform float uScale;
uniform float uAccentMix;

varying vec3 vNormalV;
varying vec3 vViewDir;

${inkCommon}

void main() {
  vec3 n = normalize(vNormalV);
  vec3 v = normalize(vViewDir);
  vec3 lightDir = normalize(vec3(0.55, 0.8, 0.65));

  float light = 0.18 + 0.82 * max(dot(n, lightDir), 0.0);

  // Darken toward the silhouette, which is where a pen would crowd its strokes.
  float rim = pow(1.0 - max(dot(n, v), 0.0), 2.0);
  light *= 1.0 - rim * 0.55;

  float ink = hatchTone(gl_FragCoord.xy, light, uScale);

  vec3 stroke = mix(uInk, uAccent, uAccentMix);
  gl_FragColor = vec4(mix(uPaper, stroke, ink), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
