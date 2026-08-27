import Portrait from "../Portrait";
import SketchObject from "../SketchObject";
import { anchorOf } from "../../three/stations";

/**
 * The first page: a drawn figure with a few solids scattered around it the way you doodle
 * in a margin while you are thinking about something else.
 */
export default function Marginalia({ motion = 1 }) {
    return (
        <group position={anchorOf("home")}>
            <Portrait height={6.1} position={[0.15, 0.35, 0]} />

            <SketchObject position={[3.3, 3.0, -1.3]} scale={0.78} spin={0.1 * motion}>
                <icosahedronGeometry args={[1, 0]} />
            </SketchObject>

            <SketchObject
                position={[-2.4, 3.5, -1.7]}
                scale={0.6}
                spin={-0.16 * motion}
                accent={0.9}
                hatchScale={0.9}
            >
                <torusKnotGeometry args={[0.72, 0.26, 128, 16]} />
            </SketchObject>

            <SketchObject position={[-2.7, -2.5, -1.1]} scale={0.5} spin={0.22 * motion} hatchScale={1.2}>
                <boxGeometry args={[1.2, 1.2, 1.2]} />
            </SketchObject>
        </group>
    );
}
