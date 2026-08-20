import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { BoxGeometry, Matrix4, OctahedronGeometry, Quaternion, Vector3 } from "three";
import Built from "../Built";
import { mergeParts } from "../merge";
import { anchorOf } from "../stations";
import { scroll } from "../store";
import { profile } from "../../data/profile";

const COLS = 5;
const ROWS = 3;
const SPACING = 1.62;
const DEPTH = 0.72;
const UP = new Vector3(0, 1, 0);

/** A gently vaulted grid shell: nodes on two chords, braced diagonally. */
function layout() {
    const top = [];
    const bottom = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const x = (c - (COLS - 1) / 2) * SPACING;
            const z = (r - (ROWS - 1) / 2) * SPACING;
            // Vault the shell so it reads as a structure rather than a flat grid.
            const sag = Math.cos((x / (COLS * SPACING)) * Math.PI) * 0.55;
            top.push(new Vector3(x, sag, z));
            bottom.push(new Vector3(x, sag - DEPTH, z));
        }
    }
    return { top, bottom };
}

export default function Truss({ motion = 1 }) {
    const anchor = useMemo(() => anchorOf("skills"), []);
    const group = useRef();
    const [near, setNear] = useState(false);

    const nodes = useMemo(layout, []);

    const geometry = useMemo(() => {
        const parts = [];
        const matrix = new Matrix4();
        const rotation = new Quaternion();
        const scale = new Vector3(1, 1, 1);

        const beam = (a, b, thickness) => {
            const dir = new Vector3().subVectors(b, a);
            const length = dir.length();
            if (length < 0.001) return;
            rotation.setFromUnitVectors(UP, dir.clone().normalize());
            matrix.compose(new Vector3().addVectors(a, b).multiplyScalar(0.5), rotation, scale);
            parts.push({ geometry: new BoxGeometry(thickness, length, thickness), matrix: matrix.clone() });
            matrix.identity();
            rotation.identity();
        };

        const at = (list, r, c) => list[r * COLS + c];

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (c < COLS - 1) {
                    beam(at(nodes.top, r, c), at(nodes.top, r, c + 1), 0.05);
                    beam(at(nodes.bottom, r, c), at(nodes.bottom, r, c + 1), 0.045);
                }
                if (r < ROWS - 1) {
                    beam(at(nodes.top, r, c), at(nodes.top, r + 1, c), 0.05);
                    beam(at(nodes.bottom, r, c), at(nodes.bottom, r + 1, c), 0.045);
                }
                // Verticals and the diagonal bracing that makes a truss a truss.
                beam(at(nodes.top, r, c), at(nodes.bottom, r, c), 0.04);
                if (c < COLS - 1 && r < ROWS - 1) {
                    beam(at(nodes.top, r, c), at(nodes.bottom, r + 1, c + 1), 0.032);
                }
            }
        }

        const joint = new OctahedronGeometry(0.1, 0);
        for (const p of nodes.top) {
            matrix.compose(p, rotation, scale);
            parts.push({ geometry: joint.clone(), matrix: matrix.clone() });
            matrix.identity();
        }
        joint.dispose();

        return mergeParts(parts);
    }, [nodes]);


    // 15 portalled labels are not free — only mount them while the truss is on screen.
    useFrame(({ clock }) => {
        if (group.current) {
            group.current.rotation.y = 0.28 + Math.sin(clock.elapsedTime * 0.14 * motion) * 0.32;
        }
        const isNear = Math.abs(scroll.station - 3) < 0.85;
        if (isNear !== near) setNear(isNear);
    });

    return (
        <Built ref={group} geometry={geometry} station={3} jitter={0.12} noiseScale={1.4} metal={0.6} position={anchor}>
            {near &&
                profile.skills.slice(0, nodes.top.length).map((skill, i) => (
                    <Html
                        key={skill}
                        position={nodes.top[i]}
                        center
                        distanceFactor={11}
                        zIndexRange={[20, 0]}
                        style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                        <span className="skill-star">{skill}</span>
                    </Html>
                ))}
        </Built>
    );
}
