import { useMemo } from "react";
import SketchObject from "../SketchObject";
import InkLine from "../InkLine";
import { anchorOf } from "../../three/stations";
import { profile } from "../../data/profile";

/**
 * Seven years drawn as a climb: one plate per role, stepping up and alternating sides, with
 * a single line threaded through them. The plate you are standing on now is the one ringed
 * in accent.
 */
const RISE = 1.05;

export default function Ladder({ motion = 1 }) {
    const roles = profile.experience;

    // Oldest at the bottom, so the climb reads the way a career does.
    const rungs = useMemo(
        () =>
            roles
                .slice()
                .reverse()
                .map((role, i) => {
                    const side = i % 2 === 0 ? -1 : 1;
                    const y = -2.6 + i * RISE;
                    return {
                        key: `${role.role}-${role.period}`,
                        position: [side * 1.15, y, side * 0.35],
                        rotation: [0, side * 0.28, side * 0.035],
                        width: 2.5 - i * 0.06,
                        current: i === roles.length - 1,
                    };
                }),
        [roles],
    );

    const spine = useMemo(() => rungs.map((r) => [r.position[0] * 0.55, r.position[1], r.position[2] * 0.5]), [rungs]);

    return (
        <group position={anchorOf("experience")} rotation={[0, 0.18, 0]}>
            {rungs.map((rung, i) => (
                <SketchObject
                    key={rung.key}
                    position={rung.position}
                    rotation={rung.rotation}
                    spin={0}
                    sway={0.35 * motion}
                    thickness={0.026}
                    hatchScale={0.95 + i * 0.07}
                    accent={rung.current ? 0.9 : 0}
                >
                    <boxGeometry args={[rung.width, 0.26, 1.1]} />
                </SketchObject>
            ))}

            <InkLine points={spine} jitter={0.09} seed={41} opacity={0.55} segments={90} />

            {/* A marker at the top of the climb — where the work is now. */}
            <SketchObject
                position={[spine[spine.length - 1][0], spine[spine.length - 1][1] + 1.15, 0]}
                spin={0.22 * motion}
                scale={0.42}
                hatchScale={0.85}
                accent={0.75}
            >
                <octahedronGeometry args={[1, 0]} />
            </SketchObject>
        </group>
    );
}
