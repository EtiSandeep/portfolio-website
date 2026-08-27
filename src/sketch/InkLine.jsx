import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, CatmullRomCurve3, Vector3 } from "three";
import { makeRng } from "../three/rng";
import { ink } from "./palette";

/**
 * A line as a hand would draw it.
 *
 * The control points are resampled along a smooth curve and then knocked off true by a
 * seeded jitter, so the stroke overshoots and wanders slightly. Drawing it twice at
 * different seeds gives the "gone over it again" look that separates a sketch from a plot.
 */
export default function InkLine({
    points,
    segments = 48,
    jitter = 0.06,
    seed = 1,
    passes = 2,
    opacity = 0.7,
    accent = false,
    closed = false,
}) {
    const geometries = useMemo(() => {
        const curve = new CatmullRomCurve3(
            points.map((p) => (p instanceof Vector3 ? p.clone() : new Vector3(...p))),
            closed,
        );

        return Array.from({ length: passes }, (_, pass) => {
            const rng = makeRng(seed * 7919 + pass * 104729);
            const verts = [];
            for (let i = 0; i <= segments; i++) {
                const p = curve.getPoint(i / segments);
                // Leave the ends closer to true than the middle — a drawn line is most
                // confident where it starts and stops.
                const bow = Math.sin((i / segments) * Math.PI);
                p.x += (rng() - 0.5) * jitter * bow;
                p.y += (rng() - 0.5) * jitter * bow;
                p.z += (rng() - 0.5) * jitter * bow;
                verts.push(p);
            }
            return new BufferGeometry().setFromPoints(verts);
        });
    }, [points, segments, jitter, seed, passes, closed]);

    const materials = useRef([]);

    useFrame(() => {
        const colour = accent ? ink.accent : ink.stroke;
        materials.current.forEach((m) => m && m.color.copy(colour));
    });

    return (
        <group>
            {geometries.map((geometry, i) => (
                <line key={i} geometry={geometry}>
                    <lineBasicMaterial
                        ref={(m) => {
                            materials.current[i] = m;
                        }}
                        transparent
                        opacity={opacity * (i === 0 ? 1 : 0.55)}
                        depthWrite={false}
                    />
                </line>
            ))}
        </group>
    );
}
