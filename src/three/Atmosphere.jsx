import { useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { palette, snapPalette, stepPalette } from "./palette";

/**
 * Owns everything ambient: the clear colour and a rig of coloured lights that trails the
 * camera so each set piece is lit as it comes into view. Also drives the day/night
 * crossfade by nudging the shared `palette` object every frame.
 */
export default function Atmosphere({ theme, motion = 1 }) {
    const { scene } = useThree();

    const bg = useRef();
    const lights = useRef();
    const key = useRef();
    const fill = useRef();
    const rim = useRef();
    const ambient = useRef();

    useLayoutEffect(() => {
        snapPalette(theme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useFrame(({ camera, clock }, delta) => {
        const dt = Math.min(delta, 0.1);
        stepPalette(theme, 1 - Math.exp(-2.0 * dt));

        if (bg.current) bg.current.copy(palette.background);
        scene.backgroundIntensity = 1;

        if (ambient.current) {
            ambient.current.color.copy(palette.rim);
            ambient.current.intensity = palette.ambientIntensity;
        }
        if (key.current) {
            key.current.color.copy(palette.warm);
            key.current.intensity = palette.lightIntensity * 22;
        }
        if (fill.current) {
            fill.current.color.copy(palette.hot);
            fill.current.intensity = palette.lightIntensity * 16;
        }
        if (rim.current) {
            rim.current.color.copy(palette.bright);
            rim.current.intensity = palette.lightIntensity * 14;
        }

        if (lights.current) {
            const t = clock.elapsedTime * 0.25 * motion;
            lights.current.position.copy(camera.position);
            lights.current.rotation.y = t;
            lights.current.rotation.x = Math.sin(t * 0.7) * 0.3;
        }
    });

    return (
        <>
            <color ref={bg} attach="background" args={["#FFF8F0"]} />

            <ambientLight ref={ambient} intensity={1} />

            <group ref={lights}>
                <pointLight ref={key} position={[4, 3, 2]} distance={40} decay={1.6} />
                <pointLight ref={fill} position={[-5, -2, 3]} distance={40} decay={1.6} />
                <pointLight ref={rim} position={[0, 4, -6]} distance={44} decay={1.6} />
            </group>
        </>
    );
}
