import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, Matrix4, Euler, Vector3, Quaternion } from "three";
import Built from "../Built";
import { mergeParts } from "../merge";
import { anchorOf } from "../stations";

const SHEET_COUNT = 5;

/** About: a stack of drawing sheets, fanned as though just set down and squared up. */
export default function Sheets({ motion = 1 }) {
    const anchor = useMemo(() => anchorOf("about"), []);
    const group = useRef();

    const geometry = useMemo(() => {
        const parts = [];
        const matrix = new Matrix4();
        const quaternion = new Quaternion();
        const scale = new Vector3(1, 1, 1);

        for (let i = 0; i < SHEET_COUNT; i++) {
            const t = i / (SHEET_COUNT - 1);
            quaternion.setFromEuler(new Euler(0, (t - 0.5) * 0.55, (t - 0.5) * 0.12));
            matrix.compose(
                new Vector3((t - 0.5) * 0.9, -1.4 + i * 0.62, (t - 0.5) * 0.7),
                quaternion,
                scale,
            );
            parts.push({ geometry: new BoxGeometry(3.1 - i * 0.12, 0.035, 2.2 - i * 0.08), matrix: matrix.clone() });
            matrix.identity();
        }

        // A drafting rule laid across the top sheet.
        quaternion.setFromEuler(new Euler(0, 0.32, 0));
        matrix.compose(new Vector3(0.2, -1.4 + SHEET_COUNT * 0.62 + 0.06, 0.1), quaternion, scale);
        parts.push({ geometry: new BoxGeometry(3.4, 0.05, 0.16), matrix: matrix.clone() });

        return mergeParts(parts);
    }, []);


    useFrame(({ clock }) => {
        if (!group.current) return;
        const t = clock.elapsedTime * motion;
        group.current.rotation.y = 0.35 + Math.sin(t * 0.16) * 0.14;
        group.current.position.y = anchor[1] + Math.sin(t * 0.4) * 0.09;
    });

    return <Built ref={group} geometry={geometry} station={1} jitter={0.07} noiseScale={1.1} metal={0.35} position={anchor} />;
}
