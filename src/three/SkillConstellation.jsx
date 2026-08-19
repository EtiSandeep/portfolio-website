import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Vector3 } from "three";
import { baseUniforms, outputChunks } from "./uniforms";
import { fogFade, fogHelper, fogVarying } from "./glsl/fog";
import { anchorOf } from "./stations";
import { scroll } from "./store";
import { profile } from "../data/profile";

const RADIUS = 3.1;
const LINK_DISTANCE = 3.4;

const fibonacciSphere = (count, radius) => {
    const golden = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: count }, (_, i) => {
        const y = 1 - (i / Math.max(count - 1, 1)) * 2;
        const r = Math.sqrt(Math.max(1 - y * y, 0));
        const theta = golden * i;
        return new Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius);
    });
};

const nodeVertex = /* glsl */ `
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

const nodeFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uBright;
uniform vec3 uLine;
uniform vec3 uRim;
varying vec3 vNormalV;
varying vec3 vViewDir;

${fogHelper}

void main() {
  float fres = pow(1.0 - max(dot(normalize(vNormalV), normalize(vViewDir)), 0.0), 1.6);
  vec3 col = mix(uLine, uBright, fres * fres);
  col += uRim * pow(fres, 4.0) * 0.5;
  float alpha = 0.85;
  ${fogFade}
  gl_FragColor = vec4(col, alpha);
  ${outputChunks}
}
`;

const linkVertex = /* glsl */ `
attribute float aLen;
varying float vT;
varying float vLen;
${fogVarying}
void main() {
  vT = uv.x;
  vLen = aLen;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const linkFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uLine;
uniform vec3 uBright;
varying float vT;
varying float vLen;

${fogHelper}

void main() {
  // Signal running between neighbouring skills.
  float head = fract(uTime * 0.22 + vLen * 3.1);
  float d = abs(fract(vT - head + 0.5) - 0.5);
  float spark = smoothstep(0.22, 0.0, d);
  vec3 col = mix(uLine, uBright, spark);
  float alpha = 0.30 + spark * 0.6;
  ${fogFade}
  gl_FragColor = vec4(col * (0.6 + spark * 1.6), alpha);
  ${outputChunks}
}
`;

/**
 * Skills: every technology is a star, near neighbours are wired together, and the whole
 * lattice turns. Labels are real DOM so they stay crisp and selectable at any zoom.
 */
export default function SkillConstellation({ motion = 1, showLabels = true }) {
    const anchor = useMemo(() => anchorOf("skills"), []);
    const group = useRef();
    const nodeMats = useRef([]);
    const linkMat = useRef();
    const [near, setNear] = useState(false);

    const nodes = useMemo(() => fibonacciSphere(profile.skills.length, RADIUS), []);

    const links = useMemo(() => {
        const positions = [];
        const uvs = [];
        const lens = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const d = nodes[i].distanceTo(nodes[j]);
                if (d > LINK_DISTANCE) continue;
                positions.push(nodes[i].x, nodes[i].y, nodes[i].z);
                positions.push(nodes[j].x, nodes[j].y, nodes[j].z);
                uvs.push(0, 0, 1, 0);
                lens.push(d / LINK_DISTANCE, d / LINK_DISTANCE);
            }
        }
        return {
            positions: new Float32Array(positions),
            uvs: new Float32Array(uvs),
            lens: new Float32Array(lens),
        };
    }, [nodes]);

    const nodeUniformSets = useMemo(() => nodes.map(() => baseUniforms()), [nodes]);
    const linkUniforms = useMemo(() => baseUniforms(), []);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime * motion;
        if (group.current) {
            group.current.rotation.y = t * 0.13;
            group.current.rotation.x = Math.sin(t * 0.19) * 0.16;
        }
        nodeMats.current.forEach((m) => {
            if (m) m.uniforms.uTime.value = t;
        });
        if (linkMat.current) linkMat.current.uniforms.uTime.value = t;

        // Only pay for 15 portalled DOM labels while the constellation is actually on screen.
        const isNear = Math.abs(scroll.station - 3) < 0.85;
        if (isNear !== near) setNear(isNear);
    });

    return (
        <group ref={group} position={anchor}>
            <lineSegments frustumCulled={false}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[links.positions, 3]} />
                    <bufferAttribute attach="attributes-uv" args={[links.uvs, 2]} />
                    <bufferAttribute attach="attributes-aLen" args={[links.lens, 1]} />
                </bufferGeometry>
                <shaderMaterial
                    ref={linkMat}
                    vertexShader={linkVertex}
                    fragmentShader={linkFragment}
                    uniforms={linkUniforms}
                    transparent
                    depthWrite={false}
                />
            </lineSegments>

            {nodes.map((p, i) => (
                <group key={i} position={p}>
                    <mesh scale={0.13}>
                        <icosahedronGeometry args={[1, 2]} />
                        <shaderMaterial
                            ref={(el) => {
                                nodeMats.current[i] = el;
                            }}
                            vertexShader={nodeVertex}
                            fragmentShader={nodeFragment}
                            uniforms={nodeUniformSets[i]}
                            transparent
                            depthWrite={false}
                        />
                    </mesh>

                    {showLabels && near && (
                        <Html
                            center
                            distanceFactor={11}
                            zIndexRange={[20, 0]}
                            style={{ pointerEvents: "none", userSelect: "none" }}
                        >
                            <span className="skill-star">{profile.skills[i]}</span>
                        </Html>
                    )}
                </group>
            ))}
        </group>
    );
}
