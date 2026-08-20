import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, Matrix4, Quaternion, Vector3 } from "three";
import Built from "../Built";
import { mergeParts } from "../merge";
import { anchorOf } from "../stations";
import { profile } from "../../data/profile";

const FLOOR_HEIGHT = 0.95;
const HALF = 1.25;

/**
 * Experience: one storey per role, oldest at the base. The construction front rises through
 * it in the same order the career happened, which is the whole reason this set piece works.
 */
export default function Tower({ motion = 1 }) {
    const anchor = useMemo(() => anchorOf("experience"), []);
    const group = useRef();
    const floors = profile.experience.length;

    const geometry = useMemo(() => {
        const parts = [];
        const matrix = new Matrix4();
        const rotation = new Quaternion();
        const scale = new Vector3(1, 1, 1);
        const base = -(floors * FLOOR_HEIGHT) / 2;

        for (let i = 0; i < floors; i++) {
            const y = base + i * FLOOR_HEIGHT;
            // Upper storeys step in slightly, so the silhouette tapers.
            const inset = HALF - i * 0.055;

            matrix.compose(new Vector3(0, y, 0), rotation, scale);
            parts.push({ geometry: new BoxGeometry(inset * 2, 0.11, inset * 2), matrix: matrix.clone() });
            matrix.identity();

            for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
                matrix.compose(
                    new Vector3(sx * (inset - 0.1), y + FLOOR_HEIGHT / 2, sz * (inset - 0.1)),
                    rotation,
                    scale,
                );
                parts.push({ geometry: new BoxGeometry(0.09, FLOOR_HEIGHT, 0.09), matrix: matrix.clone() });
                matrix.identity();
            }
        }

        // Roof slab caps the newest role.
        matrix.compose(new Vector3(0, base + floors * FLOOR_HEIGHT, 0), rotation, scale);
        const cap = HALF - floors * 0.055 + 0.12;
        parts.push({ geometry: new BoxGeometry(cap * 2, 0.14, cap * 2), matrix: matrix.clone() });

        return mergeParts(parts);
    }, [floors]);


    useFrame(({ clock }) => {
        if (group.current) group.current.rotation.y = clock.elapsedTime * 0.1 * motion;
    });

    return <Built ref={group} geometry={geometry} station={2} jitter={0.05} noiseScale={0.8} metal={0.55} position={anchor} />;
}
