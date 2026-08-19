import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { FrontSide } from "three";
import { baseUniforms, iridescence, outputChunks } from "./uniforms";
import { fogHelper, fogVarying } from "./glsl/fog";
import { anchorOf } from "./stations";
import { profile } from "../data/profile";

const vertex = /* glsl */ `
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

const fragment = /* glsl */ `
uniform float uTime;
uniform float uSeed;
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
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.0);

  float depth = smoothstep(-1.4, 1.4, vLocal.y);
  vec3 body = mix(uDeep, uHot, depth);
  body = mix(body, uWarm, fres * 0.45);
  body = mix(body, iridescent(fres * 0.6 + uSeed + uTime * 0.02), 0.3);

  // Blueprint lattice etched into the face.
  vec2 grid = abs(fract(vLocal.xy * 4.0) - 0.5);
  float lattice = smoothstep(0.06, 0.0, min(grid.x, grid.y));

  // A sheet of light sweeping top to bottom.
  float sweep = fract(uTime * 0.16 + uSeed);
  float scan = smoothstep(0.10, 0.0, abs(depth - sweep));

  vec3 col = body * 0.72;
  col += uAccent * lattice * 0.34;
  col += uBright * scan * (0.30 + lattice * 0.7);
  col += uRim * pow(fres, 2.2) * 0.7;

  float alpha = clamp(0.34 + fres * 0.5 + scan * 0.16 + lattice * 0.08, 0.0, 0.9);
  float haze = fogAmount();
  col = mix(col, uFogColor, haze);
  alpha *= 1.0 - haze * 0.85;
  gl_FragColor = vec4(col, alpha);
  ${outputChunks}
}
`;

const LAYOUT = [
    { position: [-1.4, 1.3, 0.4], rotation: [0, 0.42, -0.06], scale: 0.95 },
    { position: [1.1, -0.9, -0.9], rotation: [0, 0.16, 0.05], scale: 1.12 },
    { position: [3.4, 1.5, -0.2], rotation: [0, -0.3, 0.07], scale: 0.9 },
    { position: [5.1, -0.8, 1.0], rotation: [0, -0.55, -0.04], scale: 1.02 },
];

/** Projects: one holographic slab per shipped thing, drifting in a loose arc. */
export default function Monoliths({ motion = 1 }) {
    const anchor = useMemo(() => anchorOf("projects"), []);
    const group = useRef();
    const slabs = useRef([]);
    const mats = useRef([]);

    const count = Math.min(profile.projects.length, LAYOUT.length);
    const uniformSets = useMemo(
        () => LAYOUT.slice(0, count).map((_, i) => ({ ...baseUniforms(), uSeed: { value: i / count } })),
        [count],
    );

    useFrame(({ clock }) => {
        const t = clock.elapsedTime * motion;
        if (group.current) group.current.rotation.y = Math.sin(t * 0.12) * 0.16;

        slabs.current.forEach((mesh, i) => {
            if (!mesh) return;
            const base = LAYOUT[i];
            mesh.position.y = base.position[1] + Math.sin(t * 0.5 + i * 1.7) * 0.28;
            mesh.rotation.y = base.rotation[1] + Math.sin(t * 0.25 + i) * 0.22;
            mesh.rotation.z = base.rotation[2] + Math.cos(t * 0.3 + i * 2.1) * 0.05;
        });

        mats.current.forEach((m) => {
            if (m) m.uniforms.uTime.value = t;
        });
    });

    return (
        <group ref={group} position={anchor}>
            {LAYOUT.slice(0, count).map((slab, i) => (
                <RoundedBox
                    key={i}
                    ref={(el) => {
                        slabs.current[i] = el;
                    }}
                    args={[1.7, 2.7, 0.12]}
                    radius={0.07}
                    smoothness={4}
                    position={slab.position}
                    rotation={slab.rotation}
                    scale={slab.scale}
                >
                    <shaderMaterial
                        ref={(el) => {
                            mats.current[i] = el;
                        }}
                        vertexShader={vertex}
                        fragmentShader={fragment}
                        uniforms={uniformSets[i]}
                        transparent
                        depthWrite={false}
                        side={FrontSide}
                    />
                </RoundedBox>
            ))}
        </group>
    );
}
