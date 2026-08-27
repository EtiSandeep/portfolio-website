import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide, Color } from "three";
import { hatchFragment, hatchVertex, outlineFragment, outlineVertex } from "./glsl/ink";
import { PALETTE } from "./palette";

/**
 * Anything in this world is drawn twice: once inside-out and swollen along its normals to
 * lay down a contour, and once shaded with cross-hatching. That pairing is what makes a
 * solid read as a drawing rather than a render.
 */
export default function SketchObject({
    children,
    thickness = 0.035,
    scale = 1,
    hatchScale = 1,
    accent = 0,
    spin = 0.12,
    ...props
}) {
    const group = useRef();
    const outlineMat = useRef();

    const hatchUniforms = useMemo(
        () => ({
            uInk: { value: new Color(PALETTE.ink) },
            uPaper: { value: new Color(PALETTE.paper) },
            uAccent: { value: new Color(PALETTE.accent) },
            uScale: { value: hatchScale },
            uAccentMix: { value: accent },
        }),
        [hatchScale, accent],
    );

    const outlineUniforms = useMemo(
        () => ({
            uInk: { value: new Color(PALETTE.ink) },
            uThickness: { value: thickness },
            uTime: { value: 0 },
        }),
        [thickness],
    );

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        if (group.current) {
            group.current.rotation.y = t * spin;
            group.current.rotation.x = Math.sin(t * 0.35) * 0.12;
        }
        // Nudging the wobble seed makes the contour shimmer very slightly, like a line
        // redrawn each frame rather than a fixed edge.
        if (outlineMat.current) outlineMat.current.uniforms.uTime.value = Math.floor(t * 6) / 6;
    });

    return (
        <group ref={group} scale={scale} {...props}>
            <mesh>
                {children}
                <shaderMaterial
                    vertexShader={hatchVertex}
                    fragmentShader={hatchFragment}
                    uniforms={hatchUniforms}
                />
            </mesh>

            <mesh>
                {children}
                <shaderMaterial
                    ref={outlineMat}
                    vertexShader={outlineVertex}
                    fragmentShader={outlineFragment}
                    uniforms={outlineUniforms}
                    side={BackSide}
                />
            </mesh>
        </group>
    );
}
