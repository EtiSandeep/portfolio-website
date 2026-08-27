import { useMemo } from "react";
import SketchObject from "../SketchObject";
import InkLine from "../InkLine";
import { rectPath } from "../paths";
import { anchorOf } from "../../three/stations";

/**
 * Where the architecture gets argued out before any of it gets built: a board on an easel
 * with boxes and arrows on it, a marker in the tray, and a mug going cold.
 *
 * The boxes are drawn on the board's face rather than modelled, because that is what they
 * are — marks on a surface, not objects.
 */
const FACE = 0.075;  // just proud of the board, so the lines are not z-fighting it

const BOXES = [
    { at: [-1.25, 0.62, FACE], w: 1.15, h: 0.6, seed: 601 },
    { at: [0.5, 0.62, FACE], w: 1.15, h: 0.6, seed: 602, accent: true },
    { at: [-0.35, -0.5, FACE], w: 1.5, h: 0.66, seed: 603 },
];

const ARROWS = [
    { points: [[-0.66, 0.62, FACE], [-0.3, 0.66, FACE], [-0.09, 0.62, FACE]], seed: 611 },
    { points: [[0.5, 0.3, FACE], [0.3, -0.02, FACE], [-0.1, -0.16, FACE]], seed: 612 },
    { points: [[-1.25, 0.3, FACE], [-1.1, -0.02, FACE], [-0.85, -0.16, FACE]], seed: 613 },
];

export default function Whiteboard({ motion = 1 }) {
    const boxes = useMemo(
        () => BOXES.map((b) => ({ ...b, path: rectPath(b.w, b.h, 0) })),
        [],
    );

    return (
        <group position={anchorOf("about")} rotation={[0.04, 0.3, 0]}>
            {/* The board. */}
            <SketchObject
                position={[0, 0.45, 0]}
                spin={0}
                sway={0.2 * motion}
                thickness={0.024}
                hatchScale={1.35}
                lightBias={0.62}
            >
                <boxGeometry args={[4.0, 2.7, 0.12]} />
            </SketchObject>

            {boxes.map((box) => (
                <group key={box.seed} position={[box.at[0], box.at[1] + 0.45, box.at[2]]}>
                    <InkLine
                        points={box.path}
                        closed
                        segments={64}
                        jitter={0.03}
                        seed={box.seed}
                        opacity={0.9}
                        accent={box.accent}
                    />
                </group>
            ))}

            {ARROWS.map((arrow) => (
                <InkLine
                    key={arrow.seed}
                    points={arrow.points.map(([x, y, z]) => [x, y + 0.45, z])}
                    segments={22}
                    jitter={0.035}
                    seed={arrow.seed}
                    passes={1}
                    opacity={0.8}
                />
            ))}

            {/* The tray, and the marker somebody left on it. */}
            <SketchObject position={[0, -0.99, 0.16]} spin={0} sway={0} thickness={0.02} hatchScale={1.5} lightBias={0.2}>
                <boxGeometry args={[4.0, 0.12, 0.34]} />
            </SketchObject>
            <SketchObject
                position={[-1.1, -0.85, 0.2]}
                rotation={[0, 0, Math.PI / 2]}
                spin={0}
                sway={0}
                thickness={0.02}
                hatchScale={1.6}
                accent={0.7}
            >
                <cylinderGeometry args={[0.06, 0.06, 0.62, 12]} />
            </SketchObject>

            {/* Legs. */}
            {[-1.55, 1.55].map((x) => (
                <SketchObject
                    key={x}
                    position={[x, -2.05, -0.1]}
                    rotation={[0.16, 0, x < 0 ? 0.07 : -0.07]}
                    spin={0}
                    sway={0}
                    thickness={0.022}
                    hatchScale={1.5}
                >
                    <cylinderGeometry args={[0.075, 0.075, 2.1, 12]} />
                </SketchObject>
            ))}
            <SketchObject position={[0, -2.5, -0.05]} spin={0} sway={0} thickness={0.02} hatchScale={1.6}>
                <boxGeometry args={[3.0, 0.1, 0.1]} />
            </SketchObject>

            {/* The mug. Not architecture, but it is always there. */}
            <group position={[2.55, -2.82, 0.5]} scale={0.72}>
                <SketchObject spin={0} sway={0} thickness={0.03} hatchScale={0.95}>
                    <cylinderGeometry args={[0.4, 0.34, 0.72, 32, 1, true]} />
                </SketchObject>
                <SketchObject position={[0.48, 0.02, 0]} spin={0} sway={0} thickness={0.036} hatchScale={1.1}>
                    <torusGeometry args={[0.2, 0.058, 12, 28]} />
                </SketchObject>
            </group>

            {/* The floor it all stands on. */}
            <InkLine points={FLOOR} jitter={0.045} seed={623} opacity={0.4} />
        </group>
    );
}

const FLOOR = [
    [-3.2, -3.1, 0.4],
    [-1.1, -3.15, 0.4],
    [1.2, -3.06, 0.4],
    [3.3, -3.13, 0.4],
];
