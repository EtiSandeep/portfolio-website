import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector2 } from "three";
import { beamsFragment, beamsVertex } from "./glsl/beams";
import { filmUniforms } from "./palette";

/**
 * The lit room, on a quad locked to the camera. It is a backdrop, not a set piece: it never
 * moves with the world, only with the pointer, which is enough to make the air feel like it
 * has depth in front of it.
 */
export default function Beams({ motion = 1 }) {
    const mesh = useRef();
    const material = useRef();
    const { size, viewport } = useThree();
    const drift = useRef(new Vector2());

    const uniforms = useMemo(
        () => ({
            ...filmUniforms(),
            uTime: { value: 0 },
            uAspect: { value: size.width / Math.max(size.height, 1) },
            uDrift: { value: new Vector2() },
            uExposure: { value: 1 },
            uResolution: { value: new Vector2(size.width, size.height) },
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    useFrame(({ camera, clock, gl, pointer }, delta) => {
        if (!material.current) return;
        const u = material.current.uniforms;

        u.uTime.value = clock.elapsedTime;
        u.uAspect.value = size.width / Math.max(size.height, 1);

        // The drawing buffer, not the CSS box: gl_FragCoord counts device pixels, so on any
        // screen with a pixel ratio above one the two disagree.
        gl.getDrawingBufferSize(u.uResolution.value);

        // Parallax, damped hard — a camera on sticks drifts, it does not follow a mouse.
        const dt = Math.min(delta, 0.1);
        drift.current.x += (pointer.x - drift.current.x) * dt * 1.4 * motion;
        drift.current.y += (pointer.y - drift.current.y) * dt * 1.4 * motion;
        u.uDrift.value.copy(drift.current);

        if (mesh.current) {
            mesh.current.position.copy(camera.position);
            mesh.current.quaternion.copy(camera.quaternion);
            mesh.current.translateZ(-40);
        }
    });

    const span = viewport.width * 16;

    return (
        <mesh ref={mesh} frustumCulled={false} renderOrder={-1}>
            <planeGeometry args={[span, span]} />
            <shaderMaterial
                ref={material}
                vertexShader={beamsVertex}
                fragmentShader={beamsFragment}
                uniforms={uniforms}
                depthWrite={false}
                depthTest={false}
            />
        </mesh>
    );
}
