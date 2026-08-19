import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, DoubleSide } from "three";
import { simplex3d } from "./glsl/noise";
import { fogFade, fogHelper, fogVarying } from "./glsl/fog";
import { baseUniforms, iridescence, outputChunks } from "./uniforms";
import { anchorOf } from "./stations";
import { makeRng } from "./rng";

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
uniform vec3 uHot;
uniform vec3 uWarm;
uniform vec3 uBright;
varying vec2 vUv;

${fogHelper}
${iridescence}

void main() {
  float flow = fract(vUv.x * 3.0 - uTime * 0.12);
  float band = smoothstep(0.45, 0.0, abs(flow - 0.5));
  vec3 col = mix(uHot, uWarm, vUv.x);
  col = mix(col, iridescent(vUv.x + uTime * 0.03), 0.4);
  col += uBright * band * 0.8;
  float alpha = 0.55 + band * 0.45;
  ${fogFade}
  gl_FragColor = vec4(col * (0.9 + band * 1.2), alpha);
  ${outputChunks}
}
`;

const discVertex = /* glsl */ `
varying vec2 vUv;
${fogVarying}
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const discFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uHot;
uniform vec3 uWarm;
uniform vec3 uBright;
uniform vec3 uDeep;
varying vec2 vUv;

${fogHelper}
${simplex3d}
${iridescence}

void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float r = length(p);
  if (r > 1.0) discard;

  float ang = atan(p.y, p.x);
  // Swirl the sample point so the noise reads as something being drawn inward.
  float swirl = ang + (1.0 - r) * 2.6 + uTime * 0.20;
  vec3 q = vec3(cos(swirl) * r, sin(swirl) * r, uTime * 0.09);

  float n = fbm(q * 1.8, 4);
  float warp = fbm(q * 3.4 + n, 3);
  float v = n * 0.65 + warp * 0.45;

  vec3 col = mix(uDeep, uHot, smoothstep(-0.5, 0.6, v));
  col = mix(col, uWarm, smoothstep(0.1, 0.9, v));
  col = mix(col, iridescent(v * 0.5 + uTime * 0.02), 0.28);
  col += uBright * pow(1.0 - r, 3.0) * 1.4;

  float edge = smoothstep(1.0, 0.62, r);
  float alpha = edge * (0.30 + smoothstep(-0.2, 0.9, v) * 0.55);
  ${fogFade}
  gl_FragColor = vec4(col, alpha);
  ${outputChunks}
}
`;

const vortexVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;

attribute float aAngle;
attribute float aRadius;
attribute float aSpeed;
attribute float aSeed;

varying float vProgress;
varying float vSeed;
${fogVarying}

void main() {
  float prog = fract(uTime * aSpeed * 0.05 + aSeed);
  float r = mix(aRadius, 0.15, prog);
  float ang = aAngle + prog * 8.5;

  vec3 p = vec3(cos(ang) * r, sin(ang) * r, (prog - 0.5) * 2.2);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vProgress = prog;
  vSeed = aSeed;
  vFogDepth = -mv.z;

  gl_PointSize = (2.0 + prog * 5.0) * uPixelRatio * (28.0 / max(-mv.z, 0.6));
  gl_Position = projectionMatrix * mv;
}
`;

const vortexFragment = /* glsl */ `
uniform vec3 uWarm;
uniform vec3 uBright;
varying float vProgress;
varying float vSeed;

${fogHelper}

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;

  float core = pow(smoothstep(0.5, 0.0, d), 2.0);
  // Born quietly at the rim, brightest as it falls into the middle, gone at the centre.
  float life = smoothstep(0.0, 0.15, vProgress) * (1.0 - smoothstep(0.82, 1.0, vProgress));
  vec3 col = mix(uWarm, uBright, vProgress);
  float alpha = core * life * 0.9;
  ${fogFade}
  gl_FragColor = vec4(col * (0.8 + core * 1.6), alpha);
  ${outputChunks}
}
`;

const VORTEX_COUNT = 900;

/** Contact: a doorway. Something is being drawn through it, which is roughly the idea. */
export default function Portal({ motion = 1, pixelRatio = 1.5, tier = "high" }) {
    const anchor = useMemo(() => anchorOf("contact"), []);
    const group = useRef();
    const ringMat = useRef();
    const discMat = useRef();
    const vortexMat = useRef();

    const count = tier === "low" ? 300 : VORTEX_COUNT;

    const vortex = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const angles = new Float32Array(count);
        const radii = new Float32Array(count);
        const speeds = new Float32Array(count);
        const seeds = new Float32Array(count);
        const rand = makeRng(0xc0ffee);

        for (let i = 0; i < count; i++) {
            angles[i] = rand() * Math.PI * 2;
            radii[i] = 3.8 + rand() * 3.4;
            speeds[i] = 0.7 + rand() * 1.5;
            seeds[i] = rand();
        }
        return { positions, angles, radii, speeds, seeds };
    }, [count]);

    const ringUniforms = useMemo(() => baseUniforms(), []);
    const discUniforms = useMemo(() => baseUniforms(), []);
    const vortexUniforms = useMemo(
        () => ({ ...baseUniforms(), uPixelRatio: { value: pixelRatio } }),
        [pixelRatio],
    );

    useFrame(({ clock }) => {
        const t = clock.elapsedTime * motion;
        if (ringMat.current) ringMat.current.uniforms.uTime.value = t;
        if (discMat.current) discMat.current.uniforms.uTime.value = t;
        if (vortexMat.current) vortexMat.current.uniforms.uTime.value = t;
        if (group.current) {
            group.current.rotation.z = t * 0.05;
            group.current.rotation.x = Math.sin(t * 0.18) * 0.1;
        }
    });

    return (
        <group ref={group} position={anchor}>
            <mesh>
                <torusGeometry args={[4.8, 0.08, 16, 240]} />
                <shaderMaterial
                    ref={ringMat}
                    vertexShader={ringVertex}
                    fragmentShader={ringFragment}
                    uniforms={ringUniforms}
                    transparent
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </mesh>

            <mesh scale={4.7}>
                <circleGeometry args={[1, 96]} />
                <shaderMaterial
                    ref={discMat}
                    vertexShader={discVertex}
                    fragmentShader={discFragment}
                    uniforms={discUniforms}
                    transparent
                    depthWrite={false}
                    side={DoubleSide}
                    blending={AdditiveBlending}
                />
            </mesh>

            <points frustumCulled={false}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[vortex.positions, 3]} />
                    <bufferAttribute attach="attributes-aAngle" args={[vortex.angles, 1]} />
                    <bufferAttribute attach="attributes-aRadius" args={[vortex.radii, 1]} />
                    <bufferAttribute attach="attributes-aSpeed" args={[vortex.speeds, 1]} />
                    <bufferAttribute attach="attributes-aSeed" args={[vortex.seeds, 1]} />
                </bufferGeometry>
                <shaderMaterial
                    ref={vortexMat}
                    vertexShader={vortexVertex}
                    fragmentShader={vortexFragment}
                    uniforms={vortexUniforms}
                    transparent
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </points>
        </group>
    );
}
