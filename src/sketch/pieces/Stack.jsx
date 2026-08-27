import { useMemo } from "react";
import SketchObject from "../SketchObject";
import InkLine from "../InkLine";
import { anchorOf } from "../../three/stations";
import { makeRng } from "../../three/rng";

/**
 * The thing a solution architect actually draws, drawn.
 *
 * Three tiers with the calls running between them and a datastore underneath: the shape of
 * every enterprise platform, and the shape of what the copy beside it claims to build.
 * Clients on top, services in the middle, data at the bottom.
 */
const TIERS = [
    { y: 2.05, w: 3.1, d: 2.05, label: "clients" },
    { y: 0.35, w: 3.9, d: 2.45, label: "services" },
    { y: -1.35, w: 3.4, d: 2.2, label: "data" },
];

/** Where the calls run. Offset in x/z so they read as separate paths, not one column. */
const CALLS = [
    [-1.0, 0.55],
    [-0.1, -0.5],
    [0.95, 0.35],
];

export default function Stack({ motion = 1 }) {
    // The blocks sitting on each tier: containers up top, a mesh of services below.
    const blocks = useMemo(() => {
        const rng = makeRng(4271);
        const out = [];

        // Clients — a handful of small, evenly-placed units.
        for (let i = 0; i < 3; i++) {
            out.push({
                key: `client-${i}`,
                position: [(i - 1) * 0.95, TIERS[0].y + 0.36, (rng() - 0.5) * 0.7],
                size: 0.3 + rng() * 0.07,
                accent: 0,
                spin: 0,
            });
        }

        // Services — more of them, less tidy, because that is how services are.
        for (let i = 0; i < 5; i++) {
            out.push({
                key: `svc-${i}`,
                position: [
                    -1.45 + i * 0.72 + (rng() - 0.5) * 0.16,
                    TIERS[1].y + 0.34,
                    (rng() - 0.5) * 1.1,
                ],
                size: 0.26 + rng() * 0.08,
                accent: i === 2 ? 0.9 : 0,
                spin: 0,
            });
        }

        return out;
    }, []);

    const calls = useMemo(
        () =>
            CALLS.flatMap(([x, z], i) => [
                {
                    key: `call-a${i}`,
                    points: [
                        [x, TIERS[0].y - 0.12, z],
                        [x + 0.06, (TIERS[0].y + TIERS[1].y) / 2, z],
                        [x, TIERS[1].y + 0.12, z],
                    ],
                    seed: 300 + i,
                },
                {
                    key: `call-b${i}`,
                    points: [
                        [x, TIERS[1].y - 0.12, z],
                        [x - 0.05, (TIERS[1].y + TIERS[2].y) / 2, z],
                        [x, TIERS[2].y + 0.12, z],
                    ],
                    seed: 400 + i,
                },
            ]),
        [],
    );

    return (
        <group position={anchorOf("home")} rotation={[0.08, -0.42, 0]} scale={0.86}>
            {TIERS.map((tier, i) => (
                <SketchObject
                    key={tier.label}
                    position={[0, tier.y, 0]}
                    spin={0}
                    sway={0.25 * motion}
                    thickness={0.026}
                    hatchScale={1.05 + i * 0.12}
                >
                    <boxGeometry args={[tier.w, 0.16, tier.d]} />
                </SketchObject>
            ))}

            {blocks.map((block) => (
                <SketchObject
                    key={block.key}
                    position={block.position}
                    scale={block.size}
                    spin={block.spin}
                    sway={0.3 * motion}
                    thickness={0.09}
                    hatchScale={0.8}
                    accent={block.accent}
                >
                    <boxGeometry args={[1, 1, 1]} />
                </SketchObject>
            ))}

            {/* The gateway everything goes through, sitting where it belongs: between the
                clients and the services. A hexagon, because that is the shape the whole
                industry has settled on for "orchestrated". Turned to face the reader —
                edge-on it is just a rectangle. */}
            <SketchObject
                position={[0, (TIERS[0].y + TIERS[1].y) / 2, 0]}
                rotation={[Math.PI / 2, 0, 0.26]}
                spin={0}
                sway={0.4 * motion}
                thickness={0.05}
                hatchScale={0.8}
                accent={0.85}
            >
                <cylinderGeometry args={[0.5, 0.5, 0.34, 6]} />
            </SketchObject>

            {/* The datastore. */}
            <SketchObject
                position={[0, -2.5, 0]}
                spin={0}
                sway={0.2 * motion}
                thickness={0.03}
                hatchScale={0.95}
            >
                <cylinderGeometry args={[0.92, 0.92, 1.15, 34]} />
            </SketchObject>

            {calls.map((call) => (
                <InkLine
                    key={call.key}
                    points={call.points}
                    segments={30}
                    jitter={0.07}
                    seed={call.seed}
                    opacity={0.6}
                />
            ))}
        </group>
    );
}

