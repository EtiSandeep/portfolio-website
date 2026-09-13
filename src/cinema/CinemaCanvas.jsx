import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import CinemaWorld from "./CinemaWorld";

/**
 * ACES, deliberately. It is the transform the industry actually grades through, and it is
 * the reason highlights in the shafts roll off instead of clipping to white.
 */
export default function CinemaCanvas({ quality }) {
    return (
        <Canvas
            style={{ position: "fixed", inset: 0 }}
            dpr={quality.dpr}
            camera={{ fov: 38, near: 0.1, far: 140, position: [0, 0, 12] }}
            gl={{ alpha: false, antialias: true, powerPreference: "high-performance", stencil: false }}
            onCreated={({ gl }) => {
                gl.toneMapping = ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.05;
            }}
        >
            <Suspense fallback={null}>
                <CinemaWorld quality={quality} />
            </Suspense>
        </Canvas>
    );
}
