import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending } from "three";
import { dustFragment, dustVertex } from "./glsl/dust";
import { film } from "./palette";
import { makeRng } from "../three/rng";

/** Motes in the air. Seeded, so the field is identical on every load. */
export default function Dust({ count = 1400, motion = 1, pixelRatio = 1.5 }) {
    const material = useRef();

    const { positions, seeds, scales } = useMemo(() => {
        const rng = makeRng(20260913);
        const positions = new Float32Array(count * 3);
        const seeds = new Float32Array(count);
        const scales = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // A slab in front of the camera rather than a sphere around it: everything that
            // is never seen is wasted fill rate.
            positions[i * 3] = (rng() - 0.5) * 34;
            positions[i * 3 + 1] = (rng() - 0.5) * 18;
            positions[i * 3 + 2] = -rng() * 26 - 1;
            seeds[i] = rng();
            // A few large motes close in do more for depth than a uniform field.
            scales[i] = 0.3 + rng() * rng() * 1.5;
        }

        return { positions, seeds, scales };
    }, [count]);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uSize: { value: 11.0 },
            uPixelRatio: { value: pixelRatio },
            uBeam: { value: film.beam.clone() },
            uAmber: { value: film.amber.clone() },
        }),
        [pixelRatio],
    );

    useFrame(({ clock }) => {
        if (material.current) material.current.uniforms.uTime.value = clock.elapsedTime * motion;
    });

    return (
        <points frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
                <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
            </bufferGeometry>
            <shaderMaterial
                ref={material}
                vertexShader={dustVertex}
                fragmentShader={dustFragment}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={AdditiveBlending}
            />
        </points>
    );
}
