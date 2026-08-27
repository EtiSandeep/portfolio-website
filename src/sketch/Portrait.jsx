import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { SRGBColorSpace, TextureLoader, Vector2 } from "three";
import { portraitFragment, portraitVertex } from "./glsl/portrait";
import { inkUniforms, syncInk } from "./palette";
import SketchObject from "./SketchObject";
import InkLine from "./InkLine";

const PHOTO = `${import.meta.env.BASE_URL}portrait.jpg`;

/**
 * The photograph, drawn.
 *
 * Loaded imperatively rather than through a suspending loader so a missing file degrades to
 * a drawn placeholder instead of taking the whole scene down with it — the photo is an asset
 * the repo may simply not have yet.
 */
export default function Portrait({ height = 6.4, ...props }) {
    const [texture, setTexture] = useState(null);
    const [failed, setFailed] = useState(false);
    const material = useRef();
    const reveal = useRef(1);

    useEffect(() => {
        let cancelled = false;
        new TextureLoader().load(
            PHOTO,
            (tex) => {
                if (cancelled) return;
                tex.colorSpace = SRGBColorSpace;
                setTexture(tex);
            },
            undefined,
            () => !cancelled && setFailed(true),
        );
        return () => {
            cancelled = true;
        };
    }, []);

    const uniforms = useMemo(
        () => ({
            ...inkUniforms(),
            uPhoto: { value: null },
            uTexel: { value: new Vector2(1 / 1024, 1 / 1536) },
            uScale: { value: 0.85 },
            uEdgeGain: { value: 1.5 },
            uReveal: { value: 1 },
        }),
        [],
    );

    useEffect(() => {
        if (!texture || !material.current) return;
        material.current.uniforms.uPhoto.value = texture;
        material.current.uniforms.uTexel.value.set(
            1 / texture.image.width,
            1 / texture.image.height,
        );
        reveal.current = 0;
    }, [texture]);

    useFrame((_, delta) => {
        syncInk(material.current?.uniforms);
        if (!material.current || !texture) return;
        // Draw it on once, from the top down.
        reveal.current = Math.min(reveal.current + delta * 0.55, 1);
        material.current.uniforms.uReveal.value = 1 - reveal.current;
    });

    if (failed) return <PortraitPlaceholder height={height} {...props} />;
    if (!texture) return null;

    const aspect = texture.image.width / texture.image.height;

    return (
        <mesh {...props}>
            <planeGeometry args={[height * aspect, height]} />
            <shaderMaterial
                ref={material}
                vertexShader={portraitVertex}
                fragmentShader={portraitFragment}
                uniforms={uniforms}
                transparent
                depthWrite={false}
            />
        </mesh>
    );
}

/**
 * Shown until public/portrait.jpg exists.
 *
 * Not an empty frame with a note in it — a page missing its photograph should still look
 * like a finished page. A hatched geodesic with two rings drawn round it holds the same
 * spot and the same weight, and gives way the moment the real photograph lands.
 */
function PortraitPlaceholder({ height, ...props }) {
    const r = height * 0.2;
    const inner = useMemo(() => ringPoints(r * 1.7), [r]);

    return (
        <group {...props}>
            <SketchObject scale={r} spin={0.07} hatchScale={0.8} thickness={0.014}>
                <icosahedronGeometry args={[1, 1]} />
            </SketchObject>

            <group rotation={[0.42, 0, 0.22]}>
                <InkLine
                    points={inner}
                    closed
                    segments={110}
                    jitter={0.08}
                    seed={71}
                    opacity={0.45}
                />
            </group>

        </group>
    );
}

/** Eight points is enough for the curve to read as a circle once it is resampled. */
const ringPoints = (radius) =>
    Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return [Math.cos(a) * radius, Math.sin(a) * radius, 0];
    });
