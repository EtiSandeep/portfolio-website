import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Vector3 } from "three";
import { baseUniforms, outputChunks } from "./uniforms";
import { STATIONS } from "./stations";
import { makeRng } from "./rng";

const vertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;

attribute float aSeed;
attribute float aScale;
attribute float aTint;

varying float vTint;
varying float vFade;

void main() {
  float s = aSeed * 6.28318;
  vec3 drift = vec3(
    sin(uTime * 0.13 + s) * 0.9,
    cos(uTime * 0.11 + s * 1.7) * 0.7,
    sin(uTime * 0.09 + s * 2.3) * 0.9
  );

  vec4 mv = modelViewMatrix * vec4(position + drift, 1.0);
  float dist = -mv.z;

  // Fade motes that are right on top of the lens or lost in the fog.
  vFade = smoothstep(0.6, 4.0, dist) * (1.0 - smoothstep(18.0, 34.0, dist));
  vTint = aTint;

  gl_PointSize = aScale * uPixelRatio * (34.0 / max(dist, 0.6));
  gl_Position = projectionMatrix * mv;
}
`;

const fragment = /* glsl */ `
uniform vec3 uDust;
uniform vec3 uBright;
uniform vec3 uAccent;

varying float vTint;
varying float vFade;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;

  float core = smoothstep(0.5, 0.0, d);
  float halo = pow(core, 3.0);

  vec3 col = mix(uDust, uBright, smoothstep(0.35, 1.0, vTint));
  col = mix(col, uAccent, smoothstep(0.0, 0.3, 1.0 - vTint) * 0.4);

  float alpha = (core * 0.35 + halo * 0.8) * vFade;
  gl_FragColor = vec4(col * (0.7 + halo * 1.5), alpha);
  ${outputChunks}
}
`;

/** Dust scattered along the whole flight path, thicker near the route than far from it. */
export default function StarDust({ count = 2600, motion = 1, pixelRatio = 1.5 }) {
    const mat = useRef();

    const geometry = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const seeds = new Float32Array(count);
        const scales = new Float32Array(count);
        const tints = new Float32Array(count);

        const rand = makeRng(0x5eed1);

        const a = new Vector3();
        const b = new Vector3();
        const p = new Vector3();
        const segments = STATIONS.length - 1;

        for (let i = 0; i < count; i++) {
            const s = rand() * segments;
            const seg = Math.min(Math.floor(s), segments - 1);
            a.set(...STATIONS[seg].anchor);
            b.set(...STATIONS[seg + 1].anchor);
            p.lerpVectors(a, b, s - seg);

            // Gaussian-ish spread so the corridor has soft edges.
            const spread = (rand() + rand() + rand() - 1.5) * 2;
            positions[i * 3] = p.x + spread * 6.5;
            positions[i * 3 + 1] = p.y + (rand() - 0.5) * 16;
            positions[i * 3 + 2] = p.z + spread * 6.0 + (rand() - 0.5) * 10;

            seeds[i] = rand();
            scales[i] = 0.35 + Math.pow(rand(), 3) * 2.6;
            tints[i] = rand();
        }

        return { positions, seeds, scales, tints };
    }, [count]);

    const uniforms = useMemo(
        () => ({ ...baseUniforms(), uPixelRatio: { value: pixelRatio } }),
        [pixelRatio],
    );

    useFrame(({ clock }) => {
        if (mat.current) mat.current.uniforms.uTime.value = clock.elapsedTime * motion;
    });

    return (
        <points frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[geometry.positions, 3]} />
                <bufferAttribute attach="attributes-aSeed" args={[geometry.seeds, 1]} />
                <bufferAttribute attach="attributes-aScale" args={[geometry.scales, 1]} />
                <bufferAttribute attach="attributes-aTint" args={[geometry.tints, 1]} />
            </bufferGeometry>
            <shaderMaterial
                ref={mat}
                vertexShader={vertex}
                fragmentShader={fragment}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={AdditiveBlending}
            />
        </points>
    );
}
