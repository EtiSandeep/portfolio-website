import { useMemo } from "react";
import SketchObject from "../SketchObject";
import InkLine from "../InkLine";
import { anchorOf } from "../../three/stations";
import { profile } from "../../data/profile";

/**
 * Four boards pinned up on the wall, one per project, each with a corner turned up. Pinned
 * work is how you look at four things at once and decide which one to talk about.
 */
const LAYOUT = [
    { position: [-1.85, 1.25, 0.3], rotation: [0.04, 0.34, -0.05], size: [2.7, 1.85] },
    { position: [1.75, 1.55, -0.4], rotation: [-0.05, -0.28, 0.06], size: [2.5, 1.7] },
    { position: [-1.95, -1.45, -0.2], rotation: [0.06, 0.22, 0.04], size: [2.55, 1.75] },
    { position: [1.9, -1.2, 0.45], rotation: [-0.03, -0.36, -0.06], size: [2.65, 1.8] },
];

export default function Panels({ motion = 1 }) {
    const boards = useMemo(
        () => profile.projects.slice(0, LAYOUT.length).map((p, i) => ({ ...LAYOUT[i], key: p.title, index: i })),
        [],
    );

    return (
        <group position={anchorOf("projects")} rotation={[0, -0.1, 0]}>
            {boards.map((board) => (
                <group key={board.key} position={board.position} rotation={board.rotation}>
                    <SketchObject
                        spin={0}
                        sway={0.4 * motion}
                        thickness={0.022}
                        hatchScale={1.25}
                        accent={board.index === 0 ? 0.8 : 0}
                    >
                        <boxGeometry args={[board.size[0], board.size[1], 0.075]} />
                    </SketchObject>

                    {/* The pin, and the ruled lines standing in for whatever is written on it. */}
                    <SketchObject
                        position={[0, board.size[1] / 2 - 0.16, 0.11]}
                        spin={0}
                        sway={0}
                        scale={0.1}
                        thickness={0.1}
                        hatchScale={0.6}
                        accent={0.95}
                    >
                        <sphereGeometry args={[1, 14, 12]} />
                    </SketchObject>

                    {[0.28, 0.02, -0.24].map((y, i) => (
                        <InkLine
                            key={y}
                            points={[
                                [-board.size[0] / 2 + 0.32, y, 0.05],
                                [0, y - 0.02, 0.05],
                                [board.size[0] / 2 - (i === 2 ? 1.1 : 0.32), y, 0.05],
                            ]}
                            segments={22}
                            jitter={0.035}
                            seed={board.index * 31 + i}
                            passes={1}
                            opacity={0.42}
                        />
                    ))}
                </group>
            ))}
        </group>
    );
}
