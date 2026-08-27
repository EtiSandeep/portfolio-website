import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute } from "three";
import SketchObject from "../SketchObject";
import InkLine from "../InkLine";
import { anchorOf } from "../../three/stations";

/**
 * The last page: a paper dart, and the loop it is about to fly. Folding the sheet you have
 * been drawing on and throwing it at someone is, more or less, what a contact section is.
 */
const NOSE = [0, 0, 1.75];
const TAIL = [0, 0, -0.9];
const KEEL = [0, -0.34, -0.95];
const LEFT = [-1.1, 0.07, -0.85];
const RIGHT = [1.1, 0.07, -0.85];

const dartGeometry = () => {
    const faces = [
        [NOSE, LEFT, TAIL],   // left wing, upper surface
        [NOSE, TAIL, RIGHT],  // right wing, upper surface
        [NOSE, KEEL, LEFT],   // left keel
        [NOSE, RIGHT, KEEL],  // right keel
        [TAIL, LEFT, KEEL],   // the fold at the back
        [TAIL, KEEL, RIGHT],
    ];

    // A hand-listed triangle soup will not agree on winding, and a face wound the wrong way
    // ends up with an inward normal — which the hatching reads as full shadow and fills in
    // solid. Flip any face whose normal points back toward the middle of the dart.
    const centre = [0, -0.05, 0.1];
    const wound = faces.map(([a, b, c]) => {
        const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        const n = [
            u[1] * v[2] - u[2] * v[1],
            u[2] * v[0] - u[0] * v[2],
            u[0] * v[1] - u[1] * v[0],
        ];
        const mid = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
        const out = [mid[0] - centre[0], mid[1] - centre[1], mid[2] - centre[2]];
        const facingOut = n[0] * out[0] + n[1] * out[1] + n[2] * out[2] > 0;
        return facingOut ? [a, b, c] : [a, c, b];
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(wound.flat(2), 3));
    geometry.computeVertexNormals();
    return geometry;
};

export default function Plane({ motion = 1 }) {
    const dart = useMemo(() => dartGeometry(), []);
    const flier = useRef();

    // The path it flies, and the path drawn behind it, are the same handful of points. It
    // arcs over the top of the sheet the copy sits on, rather than behind it.
    const path = useMemo(
        () => [
            [-7.6, -1.8, 1.6],
            [-5.4, 2.2, -0.4],
            [-2.0, 4.3, 0.6],
            [2.0, 4.5, 0.2],
            [5.6, 2.4, 1.2],
            [7.5, -1.4, 0.4],
        ],
        [],
    );

    useFrame(({ clock }) => {
        if (!flier.current) return;
        const t = clock.elapsedTime * 0.16 * motion;
        const u = (t % 1 + 1) % 1;

        // A cheap read straight off the control points is smooth enough at this speed, and
        // avoids carrying a curve object around just to sample it.
        const i = Math.min(Math.floor(u * (path.length - 1)), path.length - 2);
        const f = u * (path.length - 1) - i;
        const a = path[i];
        const b = path[i + 1];

        flier.current.position.set(
            a[0] + (b[0] - a[0]) * f,
            a[1] + (b[1] - a[1]) * f + Math.sin(t * 12) * 0.05,
            a[2] + (b[2] - a[2]) * f,
        );
        flier.current.rotation.y = Math.atan2(b[0] - a[0], b[2] - a[2]);
        flier.current.rotation.z = -Math.sin(t * 6.2) * 0.14;
        flier.current.rotation.x = -(b[1] - a[1]) * 0.28;
    });

    return (
        <group position={anchorOf("contact")}>
            <group ref={flier}>
                <SketchObject
                    geometry={dart}
                    spin={0}
                    sway={0}
                    scale={0.95}
                    thickness={0.022}
                    hatchScale={2.1}
                    accent={0.3}
                />
            </group>

            <InkLine points={path} segments={110} jitter={0.07} seed={57} opacity={0.22} passes={1} />

            {/* Two more darts, already thrown. */}
            <SketchObject
                geometry={dart}
                position={[-6.4, -2.9, -1.2]}
                rotation={[0.2, 0.9, 0.3]}
                spin={0}
                sway={0.6 * motion}
                scale={0.72}
                thickness={0.03}
                hatchScale={2.3}
            />

            <SketchObject
                geometry={dart}
                position={[6.5, -3.1, -0.9]}
                rotation={[-0.15, -1.1, -0.25]}
                spin={0}
                sway={0.5 * motion}
                scale={0.64}
                thickness={0.032}
                hatchScale={2.3}
            />
        </group>
    );
}
