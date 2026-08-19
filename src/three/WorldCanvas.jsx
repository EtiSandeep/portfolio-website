import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import World from "./World";

/**
 * The heavy half — three.js, R3F and the postprocessing stack all land in this chunk, which
 * is lazily imported so the copy paints before any of it is fetched.
 */
export default function WorldCanvas({ theme, quality }) {
    return (
        <Canvas
            dpr={quality.dpr}
            camera={{ fov: 46, near: 0.1, far: 140, position: [0, 0.4, 9.5] }}
            gl={{
                alpha: false,
                antialias: quality.tier === "low",
                powerPreference: "high-performance",
                stencil: false,
            }}
            onCreated={({ gl }) => {
                gl.toneMapping = ACESFilmicToneMapping;
                gl.toneMappingExposure = 0.95;
            }}
        >
            <Suspense fallback={null}>
                <World theme={theme} quality={quality} />
            </Suspense>
        </Canvas>
    );
}
