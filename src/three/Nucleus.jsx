import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BackSide, MathUtils } from "three";
import { simplex3d } from "./glsl/noise";
import { fogFade, fogHelper, fogMix, fogVarying } from "./glsl/fog";
import { baseUniforms, iridescence, outputChunks } from "./uniforms";
import { pointer, scroll } from "./store";
import { anchorOf } from "./stations";

const coreVertex = /* glsl */ `
uniform float uTime;
uniform float uEnergy;
uniform vec2 uPointer;

varying vec3 vNormalV;
varying vec3 vViewDir;
varying float vDisp;
${fogVarying}

${simplex3d}

float surface(vec3 dir) {
  float t = uTime * 0.22;
  float flow = fbm(dir * 1.25 + vec3(0.0, t * 0.6, t), 4);
  float ridged = 1.0 - abs(snoise(dir * 2.4 - vec3(t * 0.8, 0.0, t * 0.35)));
  float pull = smoothstep(0.25, 1.0, dot(dir, normalize(vec3(uPointer, 0.85))));
  return flow * 0.8 + ridged * 0.32 + pull * 0.28 * uEnergy;
}

vec3 displaced(vec3 dir, float amp) {
  return dir * (1.0 + surface(dir) * amp);
}

void main() {
  vec3 dir = normalize(position);
  float amp = 0.20 + uEnergy * 0.10;

  vec3 pos = displaced(dir, amp);

  // Rebuild the normal from two tangent samples so the lighting follows the ripples.
  vec3 up = abs(dir.y) > 0.95 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 tan1 = normalize(cross(dir, up));
  vec3 tan2 = cross(dir, tan1);
  float eps = 0.055;
  vec3 pa = displaced(normalize(dir + tan1 * eps), amp);
  vec3 pb = displaced(normalize(dir + tan2 * eps), amp);
  vec3 n = normalize(cross(pa - pos, pb - pos));
  if (dot(n, dir) < 0.0) n = -n;

  vDisp = surface(dir);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vNormalV = normalize(normalMatrix * n);
  vViewDir = normalize(-mv.xyz);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const coreFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uHot;
uniform vec3 uWarm;
uniform vec3 uBright;
uniform vec3 uRim;

varying vec3 vNormalV;
varying vec3 vViewDir;
varying float vDisp;

${fogHelper}
${iridescence}

void main() {
  vec3 n = normalize(vNormalV);
  vec3 v = normalize(vViewDir);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.4);

  float d = smoothstep(-0.7, 1.0, vDisp);
  vec3 base = mix(uHot, uWarm, d);
  base = mix(base, uBright, smoothstep(0.55, 1.15, vDisp));

  vec3 iri = iridescent(vDisp * 0.30 + fres * 0.6 + uTime * 0.025);
  vec3 col = mix(base, base * 0.35 + iri * 0.85, 0.38);

  // Diffuse first, so the body keeps its hue instead of washing out to white.
  vec3 lightDir = normalize(vec3(0.5, 0.8, 0.9));
  float diffuse = 0.45 + 0.55 * max(dot(n, lightDir), 0.0);
  col *= diffuse;

  float spec = pow(max(dot(reflect(-v, n), lightDir), 0.0), 56.0);
  col += uRim * spec * 0.45;
  col += mix(uBright, uRim, 0.5) * pow(fres, 1.6) * 0.55;

  // Contour filigree traced along the noise field.
  float band = abs(fract(vDisp * 5.0) - 0.5);
  float lines = smoothstep(0.035, 0.0, band - 0.455);
  col += uBright * lines * 0.3;

  ${fogMix}

  gl_FragColor = vec4(col, 1.0);
  ${outputChunks}
}
`;

const auraVertex = /* glsl */ `
varying vec3 vNormalV;
varying vec3 vViewDir;
${fogVarying}
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormalV = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const auraFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uWarm;
uniform vec3 uBright;
uniform float uEnergy;
varying vec3 vNormalV;
varying vec3 vViewDir;

${fogHelper}

void main() {
  float fres = pow(1.0 - abs(dot(normalize(vNormalV), normalize(vViewDir))), 3.2);
  float pulse = 0.75 + 0.25 * sin(uTime * 0.9);
  vec3 col = mix(uWarm, uBright, fres) * fres * pulse * (0.4 + uEnergy * 0.4);
  float alpha = fres * 0.6;
  ${fogFade}
  gl_FragColor = vec4(col, alpha);
  ${outputChunks}
}
`;

const ringVertex = /* glsl */ `
varying vec2 vUv;
${fogVarying}
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const ringFragment = /* glsl */ `
uniform float uTime;
uniform float uOffset;
uniform vec3 uBright;
uniform vec3 uAccent;
varying vec2 vUv;

${fogHelper}

void main() {
  // A comet of light chasing itself around the ring.
  float head = fract(uTime * 0.14 + uOffset);
  float d = abs(fract(vUv.x - head + 0.5) - 0.5);
  float comet = smoothstep(0.16, 0.0, d);
  float base = 0.16;
  vec3 col = mix(uAccent, uBright, comet);
  float alpha = base + comet * 0.95;
  ${fogFade}
  gl_FragColor = vec4(col * (0.6 + comet * 1.6), alpha);
  ${outputChunks}
}
`;

const RINGS = [
    { rotation: [1.35, 0.2, 0.4], radius: 2.15, offset: 0.0 },
    { rotation: [-0.5, 1.1, -0.3], radius: 2.55, offset: 0.37 },
    { rotation: [0.9, -0.8, 1.2], radius: 2.95, offset: 0.71 },
];

/**
 * The hero: a noise-displaced icosahedron wrapped in an aura and three light-comet rings.
 * Everything breathes off one shared energy value that spikes while the visitor scrolls.
 */
export default function Nucleus({ tier = "high", motion = 1 }) {
    const anchor = useMemo(() => anchorOf("home"), []);
    const detail = tier === "high" ? 6 : tier === "mid" ? 5 : 4;

    const core = useRef();
    const coreMat = useRef();
    const auraMat = useRef();
    const ringMats = useRef([]);
    const energy = useRef(0);

    const coreUniforms = useMemo(() => baseUniforms(), []);
    const auraUniforms = useMemo(() => baseUniforms(), []);
    const ringUniforms = useMemo(
        () => RINGS.map((r) => ({ ...baseUniforms(), uOffset: { value: r.offset } })),
        [],
    );

    useFrame(({ clock }, delta) => {
        const dt = Math.min(delta, 0.1);
        const t = clock.elapsedTime;

        const target = MathUtils.clamp(Math.abs(scroll.velocity) * 0.5, 0, 1);
        energy.current = MathUtils.damp(energy.current, target, 2.5, dt);

        const write = (u) => {
            u.uTime.value = t * motion;
            u.uEnergy.value = energy.current * motion;
            u.uPointer.value.set(pointer.x, pointer.y);
        };

        if (coreMat.current) write(coreMat.current.uniforms);
        if (auraMat.current) write(auraMat.current.uniforms);
        ringMats.current.forEach((m) => m && write(m.uniforms));

        if (core.current) {
            core.current.rotation.y = t * 0.09 * motion;
            core.current.rotation.x = Math.sin(t * 0.16) * 0.18 * motion;
        }
    });

    return (
        <group position={anchor}>
            <mesh ref={core}>
                <icosahedronGeometry args={[1, detail]} />
                <shaderMaterial
                    ref={coreMat}
                    vertexShader={coreVertex}
                    fragmentShader={coreFragment}
                    uniforms={coreUniforms}
                />
            </mesh>

            <mesh scale={1.9}>
                <sphereGeometry args={[1, 48, 48]} />
                <shaderMaterial
                    ref={auraMat}
                    vertexShader={auraVertex}
                    fragmentShader={auraFragment}
                    uniforms={auraUniforms}
                    transparent
                    depthWrite={false}
                    side={BackSide}
                    blending={AdditiveBlending}
                />
            </mesh>

            {RINGS.map((ring, i) => (
                <mesh key={i} rotation={ring.rotation}>
                    <torusGeometry args={[ring.radius, 0.014, 3, 256]} />
                    <shaderMaterial
                        ref={(el) => {
                            ringMats.current[i] = el;
                        }}
                        vertexShader={ringVertex}
                        fragmentShader={ringFragment}
                        uniforms={ringUniforms[i]}
                        transparent
                        depthWrite={false}
                        blending={AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    );
}
