import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Quaternion, Vector3 } from "three";
import SketchObject from "../SketchObject";
import InkLine from "../InkLine";
import { anchorOf } from "../../three/stations";

/**
 * An agent loop.
 *
 * What separates an agent from a pipeline is that it comes back round: it plans, acts,
 * looks at what happened, and decides what to do next — and when the answer is "that
 * failed", it goes round again rather than falling over. So the piece is a cycle, not a
 * stack, with a token running the circuit and one accented edge cutting back early: the
 * retry that makes a system self-healing rather than merely automated.
 */
const RING = 1.95;

/** Plan, act, observe, reflect — clockwise from the top. */
const NODES = [
    { key: "plan", angle: Math.PI / 2, z: 0.35, size: 0.5 },
    { key: "act", angle: 0, z: -0.3, size: 0.46, accent: 0.9 },
    { key: "observe", angle: -Math.PI / 2, z: 0.3, size: 0.5 },
    { key: "reflect", angle: Math.PI, z: -0.35, size: 0.44 },
];

/** The tools the acting agent reaches for. */
const TOOLS = [
    { key: "t0", at: [2.95, 0.78, -0.15], size: 0.22 },
    { key: "t1", at: [3.2, -0.04, 0.3], size: 0.26 },
    { key: "t2", at: [2.9, -0.86, -0.1], size: 0.2 },
];

const UP = new Vector3(0, 1, 0);

const nodeAt = (n) => new Vector3(Math.cos(n.angle) * RING, Math.sin(n.angle) * RING, n.z);

/** A quadratic bezier, which is all an arc between two nodes needs to be. */
const bezier = (a, c, b, t) => {
    const s = 1 - t;
    return new Vector3(
        s * s * a.x + 2 * s * t * c.x + t * t * b.x,
        s * s * a.y + 2 * s * t * c.y + t * t * b.y,
        s * s * a.z + 2 * s * t * c.z + t * t * b.z,
    );
};

export default function Agents({ motion = 1 }) {
    const token = useRef();

    const { edges, retry, spokes } = useMemo(() => {
        const points = NODES.map(nodeAt);

        const built = NODES.map((node, i) => {
            const from = points[i];
            const to = points[(i + 1) % NODES.length];

            // Start and finish clear of the nodes themselves, and bow the arc outward so
            // the four edges read as a ring rather than a square.
            const dir = to.clone().sub(from).normalize();
            const a = from.clone().add(dir.clone().multiplyScalar(node.size + 0.22));
            const b = to.clone().sub(dir.clone().multiplyScalar(NODES[(i + 1) % NODES.length].size + 0.2));

            const mid = a.clone().add(b).multiplyScalar(0.5);
            const control = mid.clone().setZ(mid.z).multiplyScalar(1.0);
            control.x += mid.x * 0.34;
            control.y += mid.y * 0.34;

            // Point the head along the arc where it lands.
            const tangent = bezier(a, control, b, 1).sub(bezier(a, control, b, 0.88)).normalize();
            const quaternion = new Quaternion().setFromUnitVectors(UP, tangent);

            return {
                key: node.key,
                a,
                control,
                b,
                path: [a.toArray(), bezier(a, control, b, 0.5).toArray(), b.toArray()],
                head: b.toArray(),
                quaternion: quaternion.toArray(),
                seed: 900 + i,
            };
        });

        // The retry. Drawn as a second, wider arc doubling back from observe to act, against
        // the flow of the ring: what happened was not good enough, so do it again. A chord
        // across the middle would have been the other obvious way to draw it, but a line
        // through the centre reads as a line bisecting the ring, not as an edge.
        const observe = points[2];
        const act = points[1];
        const retryFrom = observe.clone().add(new Vector3(0.42, 0.2, 0.2));
        const retryTo = act.clone().add(new Vector3(0.05, -0.62, 0.2));
        const retryControl = new Vector3(2.85, -2.75, 0.3);
        const retryTangent = bezier(retryFrom, retryControl, retryTo, 1)
            .sub(bezier(retryFrom, retryControl, retryTo, 0.86))
            .normalize();

        const back = {
            path: [
                retryFrom.toArray(),
                bezier(retryFrom, retryControl, retryTo, 0.5).toArray(),
                retryTo.toArray(),
            ],
            head: retryTo.toArray(),
            quaternion: new Quaternion().setFromUnitVectors(UP, retryTangent).toArray(),
        };

        return {
            edges: built,
            retry: back,
            spokes: TOOLS.map((tool) => ({
                key: tool.key,
                points: [
                    act.clone().add(new Vector3(0.5, 0, 0)).toArray(),
                    [(act.x + tool.at[0]) / 2, (act.y + tool.at[1]) / 2 + 0.1, (act.z + tool.at[2]) / 2],
                    [tool.at[0] - 0.3, tool.at[1], tool.at[2]],
                ],
            })),
        };
    }, []);

    useFrame(({ clock }) => {
        if (!token.current) return;
        // One circuit every twelve seconds or so: fast enough to read as alive, slow enough
        // that it is never the thing you are looking at.
        const u = (clock.elapsedTime * 0.085 * motion) % 1;
        const span = u * edges.length;
        const edge = edges[Math.min(Math.floor(span), edges.length - 1)];
        const at = bezier(edge.a, edge.control, edge.b, span - Math.floor(span));
        token.current.position.copy(at);
    });

    return (
        <group position={anchorOf("home")} rotation={[0.12, -0.28, 0]} scale={0.92}>
            {NODES.map((node) => (
                <SketchObject
                    key={node.key}
                    position={nodeAt(node).toArray()}
                    scale={node.size}
                    spin={0.09 * motion}
                    sway={0.5 * motion}
                    thickness={0.075}
                    hatchScale={0.82}
                    accent={node.accent ?? 0}
                >
                    <dodecahedronGeometry args={[1, 0]} />
                </SketchObject>
            ))}

            {edges.map((edge) => (
                <group key={edge.key}>
                    <InkLine points={edge.path} segments={44} jitter={0.05} seed={edge.seed} opacity={0.6} />
                    <group quaternion={edge.quaternion} position={edge.head}>
                        <SketchObject spin={0} sway={0} scale={0.13} thickness={0.14} hatchScale={0.7}>
                            <coneGeometry args={[1, 2.1, 10]} />
                        </SketchObject>
                    </group>
                </group>
            ))}

            {/* The retry edge, running back against the ring. */}
            <InkLine points={retry.path} segments={52} jitter={0.07} seed={977} opacity={0.6} accent />
            <group quaternion={retry.quaternion} position={retry.head}>
                <SketchObject spin={0} sway={0} scale={0.13} thickness={0.14} hatchScale={0.7} accent={0.9}>
                    <coneGeometry args={[1, 2.1, 10]} />
                </SketchObject>
            </group>

            {/* The token going round the loop. */}
            <group ref={token}>
                <SketchObject spin={0.6 * motion} scale={0.17} thickness={0.16} hatchScale={0.6} accent={0.9}>
                    <octahedronGeometry args={[1, 0]} />
                </SketchObject>
            </group>

            {/* Tools, on the end of the acting agent's arm. */}
            {spokes.map((spoke) => (
                <InkLine key={spoke.key} points={spoke.points} segments={24} jitter={0.05} seed={990} passes={1} opacity={0.4} />
            ))}
            {TOOLS.map((tool) => (
                <SketchObject
                    key={tool.key}
                    position={tool.at}
                    scale={tool.size}
                    spin={-0.14 * motion}
                    sway={0.6 * motion}
                    thickness={0.11}
                    hatchScale={0.75}
                >
                    <boxGeometry args={[1, 1, 1]} />
                </SketchObject>
            ))}
        </group>
    );
}
