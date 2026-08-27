import SketchObject from "../SketchObject";
import InkLine from "../InkLine";
import { anchorOf } from "../../three/stations";

/**
 * The desk it all happens on: a stack of books, a mug going cold, and a pen left across the
 * page. Still-life is the oldest thing you draw when you are learning to draw, which is
 * roughly the point.
 */
const DESK_EDGE = [
    [-3.1, -1.86, 1.4],
    [-1.0, -1.9, 1.4],
    [1.2, -1.82, 1.4],
    [3.3, -1.88, 1.4],
];

const BOOKS = [
    { y: -1.42, w: 3.5, d: 2.3, h: 0.34, tilt: 0.05, hatch: 1.15 },
    { y: -1.04, w: 3.2, d: 2.1, h: 0.30, tilt: -0.09, hatch: 0.95 },
    { y: -0.70, w: 3.0, d: 1.9, h: 0.28, tilt: 0.13, hatch: 1.3, accent: 0.85 },
];

export default function Desk({ motion = 1 }) {
    return (
        <group position={anchorOf("about")} rotation={[0.06, -0.32, 0]} scale={0.84}>
            {/* The stack. Nothing spins — a desk that rotates is a carousel. */}
            {BOOKS.map((b) => (
                <SketchObject
                    key={b.y}
                    position={[0, b.y, 0]}
                    rotation={[0, b.tilt, 0]}
                    spin={0}
                    sway={0}
                    thickness={0.028}
                    hatchScale={b.hatch}
                    accent={b.accent ?? 0}
                >
                    <boxGeometry args={[b.w, b.h, b.d]} />
                </SketchObject>
            ))}

            {/* Mug, with a handle that only exists because a mug without one looks wrong. */}
            <group position={[2.35, -0.05, 0.75]}>
                <SketchObject spin={0} sway={0} hatchScale={0.95} thickness={0.026}>
                    <cylinderGeometry args={[0.52, 0.44, 0.92, 40, 1, true]} />
                </SketchObject>
                <SketchObject position={[0.62, 0.02, 0]} rotation={[0, 0, 0]} spin={0} sway={0} hatchScale={1.1}>
                    <torusGeometry args={[0.26, 0.075, 14, 32]} />
                </SketchObject>
            </group>

            {/* Pen, lying across the top book rather than standing in it. The cylinder's
                axis is Y, so the whole group is tipped a quarter turn to lay it down. */}
            <group position={[-0.3, -0.38, 1.05]} rotation={[0.1, 0, Math.PI / 2 - 0.22]}>
                <SketchObject spin={0} sway={0} hatchScale={1.5} thickness={0.018} accent={0.55}>
                    <cylinderGeometry args={[0.055, 0.055, 2.0, 14]} />
                </SketchObject>
                <SketchObject position={[0, -1.11, 0]} spin={0} sway={0} hatchScale={1.6} thickness={0.016}>
                    <coneGeometry args={[0.055, 0.26, 14]} />
                </SketchObject>
            </group>

            {/* The far edge of the desk. */}
            <InkLine
                points={DESK_EDGE}
                jitter={0.045}
                seed={23}
                opacity={0.45}
            />

            {/* A loose sheet slid out from under the stack, because there always is one. */}
            <SketchObject
                position={[-1.75, -1.56, 1.0]}
                rotation={[0, 0.42, 0]}
                spin={0}
                sway={0.25 * motion}
                thickness={0.012}
                hatchScale={1.4}
            >
                <boxGeometry args={[1.5, 0.02, 1.05]} />
            </SketchObject>
        </group>
    );
}
