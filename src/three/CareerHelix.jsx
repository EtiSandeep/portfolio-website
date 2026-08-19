import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, CatmullRomCurve3, Vector3 } from "three";
import { baseUniforms, outputChunks } from "./uniforms";
import { fogFade, fogHelper, fogVarying } from "./glsl/fog";
import { anchorOf } from "./stations";
import { profile } from "../data/profile";

const TURNS = 2.15;
const HEIGHT = 8.4;
const RADIUS = 2.35;

const helixPoint = (t) => {
    const angle = t * Math.PI * 2 * TURNS;
    // Waist the spiral slightly so it reads as a figure, not a cylinder.
    const r = RADIUS * (0.72 + 0.28 * Math.sin(t * Math.PI));
    return new Vector3(Math.cos(angle) * r, HEIGHT * (0.5 - t), Math.sin(angle) * r);
};

const ribbonVertex = /* glsl */ `
varying vec2 vUv;
${fogVarying}
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vFogDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const ribbonFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uHot;
uniform vec3 uWarm;
uniform vec3 uBright;
varying vec2 vUv;

${fogHelper}

void main() {
  // Three pulses of light chasing down the spiral, oldest role to newest.
  float pulse = 0.0;
  for (int i = 0; i < 3; i++) {
    float head = fract(uTime * 0.10 + float(i) * 0.333);
    float d = abs(fract(vUv.x - head + 0.5) - 0.5);
    pulse += smoothstep(0.09, 0.0, d);
  }
  pulse = clamp(pulse, 0.0, 1.0);

  vec3 base = mix(uHot, uWarm, vUv.x);
  vec3 col = mix(base, uBright, pulse);
  float alpha = 0.30 + pulse * 0.7;
  ${fogFade}
  gl_FragColor = vec4(col * (0.75 + pulse * 1.9), alpha);
  ${outputChunks}
}
`;

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
uniform float uSeed;
uniform vec3 uBright;
uniform vec3 uWarm;
uniform vec3 uRim;
varying vec3 vNormalV;
varying vec3 vViewDir;

${fogHelper}

void main() {
  float fres = pow(1.0 - max(dot(normalize(vNormalV), normalize(vViewDir)), 0.0), 1.8);
  float beat = 0.72 + 0.28 * sin(uTime * 1.6 + uSeed * 6.28318);
  vec3 col = mix(uWarm, uBright, fres) * beat;
  col += uRim * pow(fres, 3.0) * 0.8;
  float alpha = 0.55 + fres * 0.45;
  ${fogFade}
  gl_FragColor = vec4(col, alpha);
  ${outputChunks}
}
`;

/** Experience: the career as a lit spiral, one glowing node per role, newest at the top. */
export default function CareerHelix({ motion = 1, tier = "high" }) {
    const anchor = useMemo(() => anchorOf("experience"), []);
    const group = useRef();
    const ribbonMat = useRef();
    const nodeMats = useRef([]);
    const halos = useRef([]);

    const curve = useMemo(() => {
        const pts = Array.from({ length: 160 }, (_, i) => helixPoint(i / 159));
        return new CatmullRomCurve3(pts);
    }, []);

    const nodes = useMemo(
        () => profile.experience.map((_, i) => ({
            position: helixPoint(i / Math.max(profile.experience.length - 1, 1)),
            seed: i / profile.experience.length,
        })),
        [],
    );

    const ribbonUniforms = useMemo(() => baseUniforms(), []);
    const nodeUniformSets = useMemo(
        () => nodes.map((n) => ({ ...baseUniforms(), uSeed: { value: n.seed } })),
        [nodes],
    );

    const tubular = tier === "low" ? 120 : 260;

    useFrame(({ clock }) => {
        const t = clock.elapsedTime * motion;
        if (group.current) {
            group.current.rotation.y = t * 0.14;
        }
        if (ribbonMat.current) ribbonMat.current.uniforms.uTime.value = t;
        nodeMats.current.forEach((m) => {
            if (m) m.uniforms.uTime.value = t;
        });
        halos.current.forEach((h, i) => {
            if (!h) return;
            h.rotation.z = t * (0.4 + i * 0.08);
            const s = 1 + Math.sin(t * 1.3 + i) * 0.09;
            h.scale.setScalar(s);
        });
    });

    return (
        <group ref={group} position={anchor}>
            <mesh>
                <tubeGeometry args={[curve, tubular, 0.035, 8, false]} />
                <shaderMaterial
                    ref={ribbonMat}
                    vertexShader={ribbonVertex}
                    fragmentShader={ribbonFragment}
                    uniforms={ribbonUniforms}
                    transparent
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </mesh>

            {nodes.map((node, i) => (
                <group key={i} position={node.position}>
                    <mesh scale={0.2}>
                        <icosahedronGeometry args={[1, 3]} />
                        <shaderMaterial
                            ref={(el) => {
                                nodeMats.current[i] = el;
                            }}
                            vertexShader={nodeVertex}
                            fragmentShader={nodeFragment}
                            uniforms={nodeUniformSets[i]}
                            transparent
                            depthWrite={false}
                            blending={AdditiveBlending}
                        />
                    </mesh>
                    <mesh
                        ref={(el) => {
                            halos.current[i] = el;
                        }}
                        rotation={[Math.PI / 2, 0, 0]}
                    >
                        <torusGeometry args={[0.42, 0.006, 3, 96]} />
                        <shaderMaterial
                            vertexShader={nodeVertex}
                            fragmentShader={nodeFragment}
                            uniforms={nodeUniformSets[i]}
                            transparent
                            depthWrite={false}
                            blending={AdditiveBlending}
                        />
                    </mesh>
                </group>
            ))}
        </group>
    );
}
