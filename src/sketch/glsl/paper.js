import { inkCommon } from "./ink";

/** The sheet everything is drawn on: warm stock, visible fibre, a soft press at the edges. */
export const paperVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const paperFragment = /* glsl */ `
uniform vec3 uPaper;
uniform vec3 uPaperShade;
uniform vec3 uInk;
uniform vec2 uResolution;

varying vec2 vUv;

${inkCommon}

void main() {
  vec2 frag = gl_FragCoord.xy;

  // Fibre: fine speckle plus a slower blotch, so it does not read as uniform noise.
  vec3 col = paperTone(frag, uPaper, uPaperShade);

  // Faint ruling, the way a notebook page carries a grid you barely register.
  vec2 grid = abs(fract(frag / 46.0) - 0.5);
  float rule = 1.0 - smoothstep(0.0, 0.02, min(grid.x, grid.y));
  col = mix(col, uInk, rule * 0.045);

  // Vignette, as though the sheet curves away at the corners.
  vec2 p = (frag / uResolution - 0.5) * 2.0;
  col = mix(col, uPaperShade, smoothstep(0.75, 1.7, dot(p, p)) * 0.5);

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
