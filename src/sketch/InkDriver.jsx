import { useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ink, snapInk, stepInk } from "./palette";

/**
 * Owns the crossfade between the two drawing surfaces. Nudges the shared palette every
 * frame and keeps the clear colour on the stock, so the frame edges match the sheet even
 * before the paper quad has drawn.
 */
export default function InkDriver({ theme }) {
    const { scene } = useThree();
    const bg = useRef();

    useLayoutEffect(() => {
        snapInk(theme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useFrame((_, delta) => {
        stepInk(theme, 1 - Math.exp(-2.0 * Math.min(delta, 0.1)));
        if (bg.current) bg.current.copy(ink.ground);
        scene.backgroundIntensity = 1;
    });

    return <color ref={bg} attach="background" args={["#F4EDDC"]} />;
}
