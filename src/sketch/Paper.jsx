import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, Vector2 } from "three";
import { paperFragment, paperVertex } from "./glsl/paper";
import { PALETTE } from "./palette";

/** The sheet. Locked to the camera so it always fills the frame exactly. */
export default function Paper() {
    const mesh = useRef();
    const { size, viewport } = useThree();

    const uniforms = useMemo(
        () => ({
            uPaper: { value: new Color(PALETTE.paper) },
            uPaperShade: { value: new Color(PALETTE.paperShade) },
            uInk: { value: new Color(PALETTE.ink) },
            uResolution: { value: new Vector2(size.width, size.height) },
        }),
        [size.width, size.height],
    );

    useFrame(({ camera }) => {
        if (!mesh.current) return;
        mesh.current.position.copy(camera.position);
        mesh.current.quaternion.copy(camera.quaternion);
        mesh.current.translateZ(-30);
    });

    // Sized generously so it covers the frustum at that distance on any aspect.
    const width = viewport.width * 12;

    return (
        <mesh ref={mesh} frustumCulled={false} renderOrder={-1}>
            <planeGeometry args={[width, width]} />
            <shaderMaterial
                vertexShader={paperVertex}
                fragmentShader={paperFragment}
                uniforms={uniforms}
                depthWrite={false}
            />
        </mesh>
    );
}
