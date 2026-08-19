import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, DoubleSide } from "three";
import { glassFragment, glassVertex } from "./glsl/glass";
import { fogFade, fogHelper } from "./glsl/fog";
import { baseUniforms, outputChunks } from "./uniforms";
import { anchorOf } from "./stations";

const SHARDS = Array.from({ length: 13 }, (_, i) => {
    const golden = Math.PI * (3 - Math.sqrt(5));
    const y = 1 - (i / 12) * 2;
    const r = Math.sqrt(Math.max(1 - y * y, 0));
    const theta = golden * i;
    return {
        dir: [Math.cos(theta) * r, y, Math.sin(theta) * r],
        radius: 2.2 + (i % 4) * 0.42,
        scale: 0.34 + ((i * 7) % 5) * 0.13,
        spin: 0.12 + (i % 3) * 0.07,
        seed: i / 13,
        kind: i % 3,
    };
});

const coreFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uBright;
uniform vec3 uWarm;
varying vec3 vNormalV;
varying vec3 vViewDir;
varying vec3 vLocal;

${fogHelper}

void main() {
  float fres = pow(1.0 - abs(dot(normalize(vNormalV), normalize(vViewDir))), 2.0);
  float pulse = 0.8 + 0.2 * sin(uTime * 1.4);
  vec3 col = mix(uWarm, uBright, fres) * pulse;
  float alpha = 0.3 + fres * 0.5;
  ${fogFade}
  gl_FragColor = vec4(col * (0.35 + fres * 1.1), alpha);
  ${outputChunks}
}
`;

/**
 * About: a small bright core with faceted crystals in slow orbit — clean architecture,
 * literally. Each shard drifts on its own clock so the cluster never looks rigid.
 */
export default function CrystalBloom({ motion = 1 }) {
    const anchor = useMemo(() => anchorOf("about"), []);
    const group = useRef();
    const shards = useRef([]);
    const mats = useRef([]);
    const coreMat = useRef();

    const uniformSets = useMemo(
        () => SHARDS.map((s) => ({
            ...baseUniforms(),
            uSeed: { value: s.seed },
            uOpacity: { value: 0.22 },
        })),
        [],
    );
    const coreUniforms = useMemo(() => baseUniforms(), []);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime * motion;

        if (group.current) {
            group.current.rotation.y = t * 0.11;
            group.current.rotation.z = Math.sin(t * 0.2) * 0.12;
        }

        shards.current.forEach((mesh, i) => {
            if (!mesh) return;
            const s = SHARDS[i];
            const breathe = 1 + Math.sin(t * 0.6 + s.seed * 9) * 0.09;
            mesh.position.set(
                s.dir[0] * s.radius * breathe,
                s.dir[1] * s.radius * breathe,
                s.dir[2] * s.radius * breathe,
            );
            mesh.rotation.x = t * s.spin + s.seed * 5;
            mesh.rotation.y = t * s.spin * 1.4;
        });

        mats.current.forEach((m) => {
            if (m) m.uniforms.uTime.value = t;
        });
        if (coreMat.current) coreMat.current.uniforms.uTime.value = t;
    });

    return (
        <group ref={group} position={anchor}>
            <mesh scale={0.85}>
                <icosahedronGeometry args={[1, 2]} />
                <shaderMaterial
                    ref={coreMat}
                    vertexShader={glassVertex}
                    fragmentShader={coreFragment}
                    uniforms={coreUniforms}
                    transparent
                    depthWrite={false}
                    blending={AdditiveBlending}
                />
            </mesh>

            {SHARDS.map((s, i) => (
                <mesh
                    key={i}
                    ref={(el) => {
                        shards.current[i] = el;
                    }}
                    scale={s.scale}
                >
                    {s.kind === 0 && <octahedronGeometry args={[1, 0]} />}
                    {s.kind === 1 && <tetrahedronGeometry args={[1.15, 0]} />}
                    {s.kind === 2 && <dodecahedronGeometry args={[0.85, 0]} />}
                    <shaderMaterial
                        ref={(el) => {
                            mats.current[i] = el;
                        }}
                        vertexShader={glassVertex}
                        fragmentShader={glassFragment}
                        uniforms={uniformSets[i]}
                        transparent
                        depthWrite={false}
                        side={DoubleSide}
                    />
                </mesh>
            ))}
        </group>
    );
}
