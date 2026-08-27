import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector2 } from "three";
import { paperFragment, paperVertex } from "./glsl/paper";
import { ink, syncInk } from "./palette";

/** The surface everything is drawn on. Locked to the camera so it always fills the frame. */
export default function Paper() {
    const mesh = useRef();
    const material = useRef();
    const { size, viewport } = useThree();

    const uniforms = useMemo(
        () => ({
            uPaper: { value: ink.ground.clone() },
            uPaperShade: { value: ink.groundShade.clone() },
            uInk: { value: ink.stroke.clone() },
            uResolution: { value: new Vector2(size.width, size.height) },
        }),
        [size.width, size.height],
    );

    useFrame(({ camera }) => {
        syncInk(material.current?.uniforms);
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
                ref={material}
                vertexShader={paperVertex}
                fragmentShader={paperFragment}
                uniforms={uniforms}
                depthWrite={false}
            />
        </mesh>
    );
}
