import { Canvas } from "@react-three/fiber";
import Paper from "./Paper";
import Portrait from "./Portrait";
import SketchObject from "./SketchObject";

/**
 * The look test: paper, a drawn figure, and a few hatched solids beside it — enough to judge
 * whether pen-and-ink in 3D is the right language before the whole site commits to it.
 */
export default function SketchHero() {
    return (
        <Canvas
            style={{ position: "fixed", inset: 0 }}
            dpr={[1, 1.8]}
            gl={{ antialias: true, alpha: false }}
            camera={{ fov: 38, near: 0.1, far: 120, position: [0, 0.4, 13] }}
        >
            <Paper />

            <Portrait height={7.6} position={[3.3, -0.4, 0]} />

            {/* Solids scattered like marginalia around the figure. */}
            <SketchObject position={[5.9, 3.0, -1.4]} scale={0.9} spin={0.1}>
                <icosahedronGeometry args={[1, 0]} />
            </SketchObject>

            <SketchObject position={[0.7, 2.9, -1.8]} scale={0.62} spin={-0.16} accent={0.9} hatchScale={0.9}>
                <torusKnotGeometry args={[0.72, 0.26, 128, 16]} />
            </SketchObject>

            <SketchObject position={[0.4, -3.1, -1.2]} scale={0.55} spin={0.22} hatchScale={1.2}>
                <boxGeometry args={[1.2, 1.2, 1.2]} />
            </SketchObject>

            <SketchObject position={[6.6, -3.2, -0.6]} scale={0.6} spin={-0.1} hatchScale={1.05}>
                <torusGeometry args={[0.8, 0.3, 20, 48]} />
            </SketchObject>
        </Canvas>
    );
}
