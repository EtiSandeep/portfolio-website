import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BoxGeometry, Matrix4, Quaternion, Vector3 } from "three";
import Built from "../Built";
import { mergeParts } from "../merge";
import { anchorOf } from "../stations";
import { profile } from "../../data/profile";

// One plot per shipped project: a surveyed footprint, and the thing that got built on it.
const PLOTS = [
    { position: [-2.5, 0, -1.0], footprint: [2.0, 1.6], height: 2.4 },
    { position: [0.4, 0, 0.6], footprint: [1.7, 1.7], height: 3.3 },
    { position: [2.8, 0, -0.8], footprint: [1.5, 1.4], height: 1.9 },
    { position: [0.2, 0, -2.4], footprint: [1.3, 1.2], height: 2.8 },
];

export default function Plots({ motion = 1 }) {
    const anchor = useMemo(() => anchorOf("projects"), []);
    const group = useRef();
    const count = Math.min(profile.projects.length, PLOTS.length);

    const geometry = useMemo(() => {
        const parts = [];
        const matrix = new Matrix4();
        const rotation = new Quaternion();
        const scale = new Vector3(1, 1, 1);

        // The site itself.
        matrix.compose(new Vector3(0, -1.8, -0.6), rotation, scale);
        parts.push({ geometry: new BoxGeometry(9.2, 0.06, 7.0), matrix: matrix.clone() });
        matrix.identity();

        PLOTS.slice(0, count).forEach((plot, i) => {
            const [x, , z] = plot.position;
            const [w, d] = plot.footprint;

            // Ground slab — the surveyed plot line.
            matrix.compose(new Vector3(x, -1.72, z), rotation, scale);
            parts.push({ geometry: new BoxGeometry(w + 0.35, 0.05, d + 0.35), matrix: matrix.clone() });
            matrix.identity();

            // And the building that rises out of it.
            matrix.compose(new Vector3(x, -1.7 + plot.height / 2, z), rotation, scale);
            parts.push({ geometry: new BoxGeometry(w, plot.height, d), matrix: matrix.clone() });
            matrix.identity();

            // A setback storey, so the four are not four identical blocks.
            if (i % 2 === 0) {
                matrix.compose(
                    new Vector3(x, -1.7 + plot.height + 0.35, z),
                    rotation,
                    scale,
                );
                parts.push({ geometry: new BoxGeometry(w * 0.6, 0.7, d * 0.6), matrix: matrix.clone() });
                matrix.identity();
            }
        });

        return mergeParts(parts);
    }, [count]);


    useFrame(({ clock }) => {
        if (group.current) {
            group.current.rotation.y = 0.4 + Math.sin(clock.elapsedTime * 0.11 * motion) * 0.22;
        }
    });

    return <Built ref={group} geometry={geometry} station={4} jitter={0.06} noiseScale={0.75} metal={0.45} position={anchor} />;
}
