import { simplex3d } from "./noise";
import { fogHelper, fogVarying } from "./fog";
import { outputChunks } from "../uniforms";

/**
 * The materialise language.
 *
 * Every object in this world exists twice: as linework (the drawing) and as solid geometry
 * (the built thing). A construction front rises through the object's local height; below it
 * the solid is drawn, above it the wireframe survives. The two passes share one `uBuild`
 * uniform, so they can never disagree about where the boundary is.
 */

export const buildVarying = /* glsl */ `
varying vec3 vBuildLocal;
${fogVarying}
`;

export const buildHelper = /* glsl */ `
uniform float uBuild;        // 0 = pure drawing, 1 = fully built
uniform float uMinY;         // object's local bottom
uniform float uSpan;         // object's local height
uniform float uJitter;       // how ragged the construction front is
uniform float uNoiseScale;

varying vec3 vBuildLocal;

${simplex3d}
${fogHelper}

// Height of this fragment within the object, 0 at the bottom and 1 at the top.
float buildHeight() {
  return clamp((vBuildLocal.y - uMinY) / max(uSpan, 0.0001), 0.0, 1.0);
}

// Where the construction front currently sits. Overshoots slightly at both ends so the
// object is genuinely empty at 0 and genuinely complete at 1.
float buildFront() {
  return uBuild * 1.18 - 0.09;
}

float buildLevel() {
  return buildHeight() + fbm(vBuildLocal * uNoiseScale, 3) * uJitter;
}
`;

/** Written into the object's local position so the fragment stage can find its height. */
export const buildVertexBody = /* glsl */ `
  vBuildLocal = position;
`;

export const solidVertex = /* glsl */ `
${buildVarying}
varying vec3 vNormalV;
varying vec3 vViewDir;

void main() {
  ${buildVertexBody}
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormalV = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

export const solidFragment = /* glsl */ `
${buildHelper}

uniform vec3 uWarm;
uniform vec3 uBright;
uniform vec3 uDeep;
uniform vec3 uRim;
uniform vec3 uAccent;
uniform float uMetal;        // 0 = graphite, 1 = brass

varying vec3 vNormalV;
varying vec3 vViewDir;

void main() {
  float level = buildLevel();
  float front = buildFront();

  // Not built yet: the drawing still owns this part of the object.
  if (level > front) discard;

  vec3 n = normalize(vNormalV);
  vec3 v = normalize(vViewDir);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.2);

  vec3 lightDir = normalize(vec3(0.45, 0.85, 0.6));
  float key = max(dot(n, lightDir), 0.0);
  float fill = max(dot(n, -lightDir), 0.0);
  float diffuse = 0.55 + 0.45 * key + 0.18 * fill;
  float spec = pow(max(dot(reflect(-v, n), lightDir), 0.0), 42.0);

  vec3 body = mix(uDeep, uWarm, uMetal);
  vec3 col = body * diffuse;
  col += mix(uRim, uBright, uMetal) * spec * 0.65;
  col += uAccent * fres * 0.30;

  // The construction front itself glows — this is the moment the drawing becomes matter.
  float edge = smoothstep(0.075, 0.0, abs(level - front));
  col += uBright * edge * 1.9;

  col = mix(col, uFogColor, fogAmount());

  gl_FragColor = vec4(col, 1.0);
  ${outputChunks}
}
`;

export const lineVertex = /* glsl */ `
${buildVarying}
attribute float aDraw;      // 0..1 along the drawing order of the linework
varying float vDraw;

void main() {
  ${buildVertexBody}
  vDraw = aDraw;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

export const lineFragment = /* glsl */ `
${buildHelper}

uniform vec3 uLine;
uniform vec3 uAccent;
uniform float uDraw;        // how much of the drawing has been inked in

varying float vDraw;

void main() {
  // Ink the linework on before anything is built.
  if (vDraw > uDraw) discard;

  float level = buildLevel();
  float front = buildFront();

  // Below the front the solid has taken over, so the drawing is spent.
  if (level < front) discard;

  float edge = smoothstep(0.10, 0.0, abs(level - front));
  vec3 col = mix(uLine, uAccent, 0.25) + uAccent * edge * 1.2;

  float alpha = (0.8 + edge * 0.2) * (1.0 - fogAmount());
  gl_FragColor = vec4(col, alpha);
  ${outputChunks}
}
`;
