/**
 * The room the titles happen in.
 *
 * Not a scene so much as a lighting state: a couple of hard shafts raking in from off-frame,
 * the haze they pick out, and the fall-off into black. Drawn analytically in screen space
 * rather than modelled, because volumetric light is cheap as a function of angle and
 * ruinous as geometry — and because a title sequence only ever needs the light to *read*,
 * never to be correct.
 */

export const beamsVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const beamsFragment = /* glsl */ `
precision highp float;

uniform vec3 uVoid;
uniform vec3 uShadow;
uniform vec3 uSmoke;
uniform vec3 uBeam;
uniform vec3 uAmber;
uniform float uTime;
uniform float uAspect;
uniform vec2 uDrift;      // pointer parallax, -1..1
uniform float uExposure;
uniform vec2 uResolution;

varying vec2 vUv;

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

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += valueNoise(p) * amp;
    p *= 2.03;
    amp *= 0.5;
  }
  return v;
}

/**
 * One shaft. Cast from a source off the edge of frame, spreading as it travels, thinning as
 * it goes, and broken up by haze drifting across it — which is the part that sells it as air
 * rather than a gradient.
 */
float shaft(vec2 p, vec2 origin, float angle, float spread, float reach, float haze) {
  vec2 d = p - origin;
  float dist = length(d);
  if (dist < 0.0001) return 1.0;

  float a = atan(d.y, d.x) - angle;
  a = atan(sin(a), cos(a));   // wrap to -pi..pi so the shaft never seams

  // Across the shaft: a wedge with an actual boundary.
  //
  // A Gaussian was the obvious choice and it is the wrong one. Widen it and the frame turns
  // milky; narrow it and there is nothing to see. What makes a shaft read is that it *ends*
  // somewhere — light and not-light with a soft but definite line between — so the profile
  // is a flat core falling off over the outer half of its width.
  float width = spread * (1.0 + dist * 0.08);
  float across = 1.0 - smoothstep(width * 0.45, width, abs(a));

  // Along it: light runs out.
  float along = exp(-dist / reach);

  // Haze drifting through the beam, slower and larger than the grain that comes later.
  // Sampled with the aspect put back so it does not stretch on a wide frame.
  vec2 flow = vec2(uTime * 0.013, uTime * -0.006);
  float dust = 0.62 + 0.55 * fbm(p * vec2(uAspect, 1.0) * 3.4 + flow + origin * 3.0);
  dust = mix(1.0, dust, haze);

  return across * along * dust;
}

void main() {
  // Screen space, from gl_FragCoord — deliberately not from vUv.
  //
  // The quad this runs on is sized generously so it always covers the frustum, which means
  // its uvs span only the middle fraction of 0..1 on screen. Reading position from them
  // silently confines the whole image to a sliver of its own coordinate space: light placed
  // at the edges of frame simply never gets evaluated. Framebuffer coordinates do not care
  // how big the geometry is.
  //
  // And in the *unit* frame, not an aspect-corrected one. Correcting for aspect keeps angles
  // true but lets the composition slide: the same beam that rakes down the outer third of a
  // laptop marches straight through the middle of a phone. Placing it in fractions of the
  // frame keeps the picture the same shape everywhere and only bends the angles, which for
  // stylised light is the trade worth making.
  vec2 p = gl_FragCoord.xy / uResolution - 0.5;
  p += uDrift * 0.035;

  // The ground state stays essentially black. Most of a title frame is unlit, and the light
  // only reads as light because there is so little of it.
  float lift = smoothstep(-0.75, 0.7, p.y);
  vec3 col = mix(uVoid, uShadow, lift * 0.75);
  col = mix(col, uSmoke, smoothstep(0.45, 1.05, lift) * 0.3);

  // The sources sit just off the edge of frame, not far outside it. Put them further away
  // and all that crosses the picture is the beam's weak tail, which reads as a gradient
  // rather than as light coming from somewhere.
  //
  // Where the light goes is a composition decision, not a lighting one.
  //
  // Two hard shafts come down the outer thirds and leave a dark corridor through the middle
  // for the type to stand in. That gives the frame somewhere to be dramatic without ever
  // putting light behind a line of small copy — which is the fight that cannot be won by
  // tuning, only by moving the light.
  float wander = sin(uTime * 0.05) * 0.05;
  // Two compositions, crossfaded on the shape of the frame.
  //
  // Wide: shafts down the outer thirds, a dark corridor for centred type. Narrow: the same
  // light kept overhead, because a phone frame has no room beside type that runs nearly
  // edge to edge — there the only clear ground is above it.
  float wide = smoothstep(1.0, 1.5, uAspect);

  float left  = shaft(p, vec2(-0.70, 0.58), -1.093 + wander, 0.090, 1.20, 0.92);
  float right = shaft(p, vec2(0.76, 0.58), -2.114 - wander, 0.082, 1.15, 0.92);

  float browA = shaft(p, vec2(-0.74, 0.54), -0.13 + wander, 0.10, 1.4, 0.9);
  float browB = shaft(p, vec2(0.76, 0.58), -3.02 - wander, 0.085, 1.3, 0.9);

  // A shallow rake across the very top, so the corridor has a ceiling. Kept above the
  // eyebrow line rather than through it — amber behind small caption type is the one place
  // this grade runs out of contrast.
  float top = shaft(p, vec2(-0.80, 0.46), -0.10, 0.07, 1.5, 0.85);

  col += uBeam * left * 0.55 * wide;
  col += uBeam * right * 0.44 * wide;
  col += uBeam * browA * 0.5 * (1.0 - wide);
  col += uAmber * browB * 0.34 * (1.0 - wide);
  col += uAmber * top * mix(0.26, 0.19, wide);

  // The anamorphic streak. A horizontal smear off the brightest part of the frame, and cold,
  // because that is what the coating on a scope lens does to a hot highlight. It is one cue
  // and it does more to say "shot on a lens" than any amount of extra light would.
  vec3 cool = vec3(0.44, 0.64, 1.0);
  float hot = max(max(left, right), max(browA, browB));
  float streakY = 0.19 + sin(uTime * 0.05) * 0.02;
  float streak = exp(-abs(p.y - streakY) * 64.0) * exp(-abs(abs(p.x) - 0.34) * 2.6);
  col += cool * streak * hot * 0.75;

  // Fall-off to the corners. The frame should feel like it has edges.
  float r = dot(p, p) * 3.4;
  col *= 1.0 - smoothstep(0.06, 0.9, r) * 0.94;

  col *= uExposure;

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
