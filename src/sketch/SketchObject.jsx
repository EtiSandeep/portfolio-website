import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BackSide } from "three";
import { hatchFragment, hatchVertex, outlineFragment, outlineVertex } from "./glsl/ink";
import { inkUniforms, syncInk } from "./palette";

/**
 * Anything in this world is drawn twice: once inside-out and swollen along its normals to
 * lay down a contour, and once shaded with cross-hatching. That pairing is what makes a
 * solid read as a drawing rather than a render.
 */
export default function SketchObject({
    children,
    geometry,
    thickness = 0.035,
    hatchScale = 1,
    accent = 0,
    spin = 0.12,
    sway = 1,
    ...props
}) {
    const group = useRef();
    const hatchMat = useRef();
    const outlineMat = useRef();
    const rest = useRef(null);

    const hatchUniforms = useMemo(
        () => ({
            ...inkUniforms(),
            uScale: { value: hatchScale },
            uAccentMix: { value: accent },
        }),
        [hatchScale, accent],
    );

    const outlineUniforms = useMemo(() => {
        const { uInk, uPaper, uPaperShade } = inkUniforms();
        return { uInk, uPaper, uPaperShade, uThickness: { value: thickness }, uTime: { value: 0 } };
    }, [thickness]);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;

        if (group.current) {
            // Remember the pose the piece was placed in, then drift around it.
            if (!rest.current) {
                rest.current = [group.current.rotation.x, group.current.rotation.y];
            }
            group.current.rotation.y = rest.current[1] + t * spin;
            group.current.rotation.x = rest.current[0] + Math.sin(t * 0.35) * 0.12 * sway;
        }

        syncInk(hatchMat.current?.uniforms);
        syncInk(outlineMat.current?.uniforms);

        // Quantising the wobble seed makes the contour shimmer at roughly six frames a
        // second, like a line redrawn by hand rather than a fixed edge.
        if (outlineMat.current) outlineMat.current.uniforms.uTime.value = Math.floor(t * 6) / 6;
    });

    return (
        <group ref={group} {...props}>
            <mesh geometry={geometry}>
                {children}
                <shaderMaterial
                    ref={hatchMat}
                    vertexShader={hatchVertex}
                    fragmentShader={hatchFragment}
                    uniforms={hatchUniforms}
                />
            </mesh>

            <mesh geometry={geometry}>
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
