import { useMemo } from "react";
import { Html } from "@react-three/drei";
import { Vector3 } from "three";
import SketchObject from "../SketchObject";
import InkLine from "../InkLine";
import { anchorOf } from "../../three/stations";
import { makeRng } from "../../three/rng";
import { profile } from "../../data/profile";

/**
 * The page where you stop writing sentences and start drawing bubbles joined by lines.
 * Satellites sit on a Fibonacci sphere so they never clump, and each one is wired back to
 * the middle by a line drawn twice.
 */
const RADIUS = 3.7;

const SHAPES = ["icosahedron", "octahedron", "tetrahedron", "box", "dodecahedron"];

const shapeFor = (kind) => {
    switch (kind) {
        case "octahedron": return <octahedronGeometry args={[1, 0]} />;
        case "tetrahedron": return <tetrahedronGeometry args={[1, 0]} />;
        case "box": return <boxGeometry args={[1.4, 1.4, 1.4]} />;
        case "dodecahedron": return <dodecahedronGeometry args={[1, 0]} />;
        default: return <icosahedronGeometry args={[1, 0]} />;
    }
};

export default function MindMap({ motion = 1, showLabels = true }) {
    const nodes = useMemo(() => {
        const rng = makeRng(9187);
        const skills = profile.skills;
        const count = skills.length;
        const golden = Math.PI * (3 - Math.sqrt(5));

        return skills.map((label, i) => {
            const y = 1 - (i / (count - 1)) * 2;
            const r = Math.sqrt(Math.max(1 - y * y, 0));
            const theta = golden * i;
            const at = new Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(
                RADIUS * (0.86 + rng() * 0.28),
            );
            const accent = rng() > 0.68 ? 0.85 : 0;

            return {
                label,
                at,
                scale: 0.19 + rng() * 0.16,
                shape: SHAPES[i % SHAPES.length],
                spin: (rng() - 0.5) * 0.5,
                accent,
                spoke: [[0, 0, 0], at.clone().multiplyScalar(0.5), at.clone().multiplyScalar(0.84)],
                seed: 100 + i,
            };
        });
    }, []);

    return (
        <group position={anchorOf("skills")}>
            {/* The thing in the middle that all of it is actually about. */}
            <SketchObject spin={0.09 * motion} scale={0.9} hatchScale={0.8} thickness={0.04}>
                <icosahedronGeometry args={[1, 1]} />
            </SketchObject>

            {nodes.map((node) => (
                <group key={node.label}>
                    <InkLine
                        points={node.spoke}
                        segments={26}
                        jitter={0.12}
                        seed={node.seed}
                        opacity={0.4}
                        accent={node.accent > 0}
                    />

                    <group position={node.at.toArray()}>
                        <SketchObject
                            scale={node.scale}
                            spin={node.spin * motion}
                            hatchScale={0.75}
                            thickness={0.055}
                            accent={node.accent}
                        >
                            {shapeFor(node.shape)}
                        </SketchObject>

                        {/* Each bubble gets its name written beside it, in the same hand. */}
                        {/* Deliberately not scaled by distance: annotations on a drawing
                            are written at the size of a hand, not the size of the thing. */}
                        {showLabels && (
                            <Html
                                center
                                position={[0, node.scale + 0.4, 0]}
                                zIndexRange={[20, 0]}
                                style={{ pointerEvents: "none", userSelect: "none" }}
                            >
                                <span className="skill-star">{node.label}</span>
                            </Html>
                        )}
                    </group>
                </group>
            ))}
        </group>
    );
}
