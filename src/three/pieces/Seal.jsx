import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, CylinderGeometry, Matrix4, Quaternion, TorusGeometry, Vector3 } from "three";
import Built from "../Built";
import { mergeParts } from "../merge";
import { anchorOf } from "../stations";

const RADIUS = 4.7;
const TICKS = 36;

/**
 * Contact: the approval seal at the corner of a finished drawing. It is the last thing to
 * materialise, which is the point — the drawing is done, the work is signed off.
 */
export default function Seal({ motion = 1 }) {
    const anchor = useMemo(() => anchorOf("contact"), []);
    const group = useRef();

    const geometry = useMemo(() => {
        const parts = [];
        const matrix = new Matrix4();
        const rotation = new Quaternion();
        const scale = new Vector3(1, 1, 1);
        const flat = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);

        // Outer and inner rings.
        matrix.compose(new Vector3(0, 0, 0), flat, scale);
        parts.push({ geometry: new TorusGeometry(RADIUS, 0.075, 12, 96), matrix: matrix.clone() });
        matrix.identity();

        matrix.compose(new Vector3(0, 0, 0), flat, scale);
        parts.push({ geometry: new TorusGeometry(RADIUS - 0.45, 0.04, 10, 84), matrix: matrix.clone() });
        matrix.identity();

        // Graduation ticks around the rim, like a protractor.
        for (let i = 0; i < TICKS; i++) {
            const angle = (i / TICKS) * Math.PI * 2;
            const major = i % 3 === 0;
            const r = RADIUS - 0.22;
            rotation.setFromAxisAngle(new Vector3(0, 0, 1), -angle);
            matrix.compose(
                new Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0),
                rotation,
                scale,
            );
            parts.push({
                geometry: new BoxGeometry(0.05, major ? 0.42 : 0.22, 0.05),
                matrix: matrix.clone(),
            });
            matrix.identity();
            rotation.identity();
        }

        // The boss at the centre of the seal.
        matrix.compose(new Vector3(0, 0, 0), flat, scale);
        parts.push({ geometry: new CylinderGeometry(0.72, 0.72, 0.16, 32), matrix: matrix.clone() });
        matrix.identity();

        // Cross hairs through the middle.
        for (const angle of [0, Math.PI / 2]) {
            rotation.setFromAxisAngle(new Vector3(0, 0, 1), angle);
            matrix.compose(new Vector3(0, 0, 0), rotation, scale);
            parts.push({ geometry: new BoxGeometry(0.05, (RADIUS - 0.45) * 2, 0.05), matrix: matrix.clone() });
            matrix.identity();
            rotation.identity();
        }

        return mergeParts(parts);
    }, []);


    useFrame(({ clock }) => {
        if (!group.current) return;
        const t = clock.elapsedTime * motion;
        group.current.rotation.z = t * 0.05;
        group.current.rotation.x = Math.sin(t * 0.18) * 0.12;
    });

    return <Built ref={group} geometry={geometry} station={5} jitter={0.08} noiseScale={0.9} metal={0.85} position={anchor} />;
}
