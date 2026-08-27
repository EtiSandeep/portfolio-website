import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, PlaneGeometry, SRGBColorSpace, TextureLoader, Vector2 } from "three";
import { portraitFragment, portraitVertex } from "./glsl/portrait";
import { PALETTE } from "./palette";

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
            uPhoto: { value: null },
            uTexel: { value: new Vector2(1 / 1024, 1 / 1536) },
            uInk: { value: new Color(PALETTE.ink) },
            uPaper: { value: new Color(PALETTE.paper) },
            uAccent: { value: new Color(PALETTE.accent) },
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

/** Shown until public/portrait.jpg exists: a drawn frame standing in for the figure. */
function PortraitPlaceholder({ height, ...props }) {
    const geometry = useMemo(() => new PlaneGeometry(height * 0.66, height), [height]);

    return (
        <lineSegments {...props}>
            <edgesGeometry args={[geometry]} />
            <lineBasicMaterial color={PALETTE.ink} transparent opacity={0.45} />
        </lineSegments>
    );
}
