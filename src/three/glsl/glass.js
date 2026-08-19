import { iridescence, outputChunks } from "../uniforms";
import { fogHelper, fogVarying } from "./fog";

// A single faceted-glass look, shared by the About crystals and the Projects monoliths.
export const glassVertex = /* glsl */ `
uniform float uTime;
varying vec3 vNormalV;
varying vec3 vViewDir;
varying vec3 vLocal;
${fogVarying}

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormalV = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  vLocal = position;
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

export const glassFragment = /* glsl */ `
uniform float uTime;
uniform float uSeed;
uniform float uOpacity;
uniform vec3 uHot;
uniform vec3 uWarm;
uniform vec3 uBright;
uniform vec3 uAccent;
uniform vec3 uDeep;
uniform vec3 uRim;

varying vec3 vNormalV;
varying vec3 vViewDir;
varying vec3 vLocal;

${fogHelper}
${iridescence}

void main() {
  vec3 n = normalize(vNormalV);
  vec3 v = normalize(vViewDir);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.1);

  float depth = smoothstep(-1.0, 1.0, vLocal.y);
  vec3 body = mix(uDeep, uHot, depth);
  body = mix(body, uWarm, fres * 0.8);

  vec3 iri = iridescent(fres * 0.7 + depth * 0.25 + uSeed + uTime * 0.02);
  vec3 col = mix(body, iri, 0.42) * 0.72;

  // Two hard facet highlights keep the silhouette readable against bright backgrounds.
  float keyFacet = pow(max(dot(n, normalize(vec3(0.45, 0.85, 0.55))), 0.0), 8.0);
  float rimFacet = pow(max(dot(n, normalize(vec3(-0.6, 0.2, 0.7))), 0.0), 14.0);
  col += uBright * keyFacet * 0.30;
  col += uAccent * rimFacet * 0.22;
  col += uRim * pow(fres, 3.0) * 0.55;

  float alpha = clamp(uOpacity + fres * 0.5, 0.0, 0.85);
  float haze = fogAmount();
  col = mix(col, uFogColor, haze);
  alpha *= 1.0 - haze * 0.85;
  gl_FragColor = vec4(col, alpha);
  ${outputChunks}
}
`;
