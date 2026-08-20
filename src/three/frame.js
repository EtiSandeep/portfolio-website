import { Vector3 } from "three";

/**
 * Pulls a wireframe skeleton — unique vertices and unique edges — out of a triangle mesh.
 * three's polyhedra are non-indexed, so shared corners appear many times over; without the
 * dedupe a geodesic dome would be built from five overlapping copies of every beam.
 */
export function skeletonOf(geometry, { keepAbove = -Infinity } = {}) {
    const position = geometry.getAttribute("position");
    const key = (i) =>
        `${position.getX(i).toFixed(4)},${position.getY(i).toFixed(4)},${position.getZ(i).toFixed(4)}`;

    const index = new Map();
    const points = [];
    const triangle = [];

    for (let i = 0; i < position.count; i++) {
        const k = key(i);
        if (!index.has(k)) {
            index.set(k, points.length);
            points.push(new Vector3(position.getX(i), position.getY(i), position.getZ(i)));
        }
        triangle.push(index.get(k));
    }

    const kept = points.map((p) => p.y >= keepAbove);
    const edges = new Set();
    for (let f = 0; f < triangle.length; f += 3) {
        const [a, b, c] = [triangle[f], triangle[f + 1], triangle[f + 2]];
        for (const [p, q] of [[a, b], [b, c], [c, a]]) {
            if (!kept[p] || !kept[q]) continue;
            edges.add(p < q ? `${p}:${q}` : `${q}:${p}`);
        }
    }

    const joints = [];
    const remap = new Map();
    points.forEach((p, i) => {
        if (!kept[i]) return;
        remap.set(i, joints.length);
        joints.push(p);
    });

    const beams = [...edges].map((e) => {
        const [p, q] = e.split(":").map(Number);
        return [remap.get(p), remap.get(q)];
    });

    return { joints, beams };
}
