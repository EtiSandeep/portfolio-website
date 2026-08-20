import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Bakes each part's transform into its vertices and merges the lot into one geometry.
 *
 * This matters for the build shader: the construction front reads a fragment's *local*
 * height, so a group left as separate meshes would have every part building from its own
 * bottom edge at once. Merged, the whole assembly shares one rising front.
 */
export function mergeParts(parts) {
    // three's primitives disagree about indexing — boxes and cylinders are indexed, the
    // polyhedra are not — and mergeGeometries refuses a mixed batch. Flatten them all.
    const prepared = parts.map(({ geometry, matrix }) => {
        const clone = geometry.index ? geometry.toNonIndexed() : geometry.clone();
        if (matrix) clone.applyMatrix4(matrix);
        return clone;
    });

    const merged = mergeGeometries(prepared, false);
    prepared.forEach((g) => g.dispose());
    parts.forEach(({ geometry, dispose = true }) => dispose && geometry.dispose());

    if (!merged) throw new Error("mergeParts: geometries had incompatible attributes");
    return merged;
}
