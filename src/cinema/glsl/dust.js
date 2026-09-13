/**
 * Motes in the beam.
 *
 * The one thing that makes volumetric light read as a room with air in it rather than a
 * gradient on glass. Each mote is a soft additive point that brightens as it drifts into a
 * shaft and dims out of it — approximated here by how close it is to the key's axis, which
 * is cheaper than sampling the beam and indistinguishable at this scale.
 */

export const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

attribute float aSeed;
attribute float aScale;

varying float vGlow;
varying float vSeed;

void main() {
  vec3 pos = position;

  // A slow convection: everything rises and wanders, nothing repeats on a beat you can see.
  float t = uTime * 0.045;
  pos.y += sin(t * 0.9 + aSeed * 6.283) * 0.55 + t * 0.35;
  pos.x += sin(t * 0.7 + aSeed * 12.9) * 0.42;
  pos.z += cos(t * 0.6 + aSeed * 9.4) * 0.38;

  // Recirculate rather than run out, so the field never empties.
  pos.y = mod(pos.y + 9.0, 18.0) - 9.0;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);

  // Only motes actually crossing the key catch anything. A field that all glows is snow.
  float inBeam = smoothstep(-2.5, 4.0, pos.y - pos.x * 0.55);
  inBeam *= inBeam;
  float depth = smoothstep(26.0, 6.0, -mv.z);
  vGlow = inBeam * depth;
  vSeed = aSeed;

  gl_PointSize = uSize * aScale * uPixelRatio * (9.0 / max(-mv.z, 3.0));
  gl_Position = projectionMatrix * mv;
}
`;

export const dustFragment = /* glsl */ `
uniform vec3 uBeam;
uniform vec3 uAmber;
uniform float uTime;

varying float vGlow;
varying float vSeed;

void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d) * 4.0;
  if (r > 1.0) discard;

  // Soft core, long tail — a mote is mostly halo.
  float alpha = pow(1.0 - r, 2.2);

  // A slow twinkle, out of phase per mote, so the field breathes.
  float flicker = 0.72 + 0.28 * sin(uTime * 1.6 + vSeed * 31.4);

  vec3 col = mix(uBeam, uAmber, fract(vSeed * 7.13) * 0.7);

  gl_FragColor = vec4(col, alpha * vGlow * flicker * 0.5);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
