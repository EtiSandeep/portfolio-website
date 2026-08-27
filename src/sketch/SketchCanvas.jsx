import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import SketchWorld from "./SketchWorld";

/**
 * The heavy half — three.js and R3F land in this chunk, which is lazily imported so the
 * copy paints before any of it is fetched. No postprocessing: bloom and tone curves are
 * exactly the wrong instincts for something meant to look like it was drawn.
 */
export default function SketchCanvas({ theme, quality }) {
    return (
        <Canvas
            dpr={quality.dpr}
            camera={{ fov: 46, near: 0.1, far: 140, position: [0, 0.4, 9.5] }}
            gl={{
                alpha: false,
                antialias: true,
                powerPreference: "high-performance",
                stencil: false,
                depth: true,
            }}
        >
            <Suspense fallback={null}>
                <SketchWorld theme={theme} quality={quality} />
            </Suspense>
        </Canvas>
    );
}
