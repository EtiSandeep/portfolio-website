import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import { palette } from "./palette";
import { scroll } from "./store";

const CA_OFFSET = new Vector2(0.0006, 0.0009);

/**
 * Grade pass. Bloom carries the glow budget for every additive material in the world, and
 * the chromatic split widens with scroll speed so fast travel smears a little.
 */
export default function Effects({ theme, tier = "high", motion = 1 }) {
    const bloom = useRef();
    const ca = useRef();

    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.1);
        if (bloom.current) {
            const k = 1 - Math.exp(-2 * dt);
            bloom.current.intensity += (palette.bloom - bloom.current.intensity) * k;
            const lum = bloom.current.luminanceMaterial;
            if (lum) lum.threshold += (palette.threshold - lum.threshold) * k;
        }
        if (ca.current) {
            const speed = Math.min(Math.abs(scroll.velocity), 4);
            const amount = (0.0004 + speed * 0.0009) * motion;
            ca.current.offset.set(amount, amount * 1.4);
        }
    });

    return (
        <EffectComposer multisampling={tier === "high" ? 4 : 0} enableNormalPass={false}>
            <Bloom
                ref={bloom}
                mipmapBlur
                intensity={0.6}
                luminanceThreshold={0.5}
                luminanceSmoothing={0.35}
                radius={0.75}
            />
            <ChromaticAberration
                ref={ca}
                offset={CA_OFFSET}
                blendFunction={BlendFunction.NORMAL}
                radialModulation
                modulationOffset={0.4}
            />
            <Vignette
                eskil={false}
                offset={0.55}
                darkness={theme === "moon" ? 0.55 : 0.22}
            />
            <Noise
                premultiply
                blendFunction={BlendFunction.SOFT_LIGHT}
                opacity={theme === "moon" ? 0.05 : 0.035}
            />
        </EffectComposer>
    );
}
