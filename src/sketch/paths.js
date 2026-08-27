/**
 * Point lists for the shapes that get drawn as lines rather than modelled as solids.
 *
 * They are deliberately sparse: InkLine resamples whatever it is given along a smooth curve,
 * so a dozen points is plenty and fewer points read as a steadier hand.
 */

/**
 * A rectangle, with a couple of points along each edge so the curve through them keeps its
 * corners instead of rounding off into an oval.
 */
export const rectPath = (w, h, z = 0) => {
    const x = w / 2;
    const y = h / 2;
    return [
        [-x, y, z], [-x * 0.34, y, z], [x * 0.34, y, z], [x, y, z],
        [x, y * 0.34, z], [x, -y * 0.34, z], [x, -y, z],
        [x * 0.34, -y, z], [-x * 0.34, -y, z], [-x, -y, z],
        [-x, -y * 0.34, z], [-x, y * 0.34, z],
    ];
};

/** A ring lying flat in the XZ plane — the collar that makes a cylinder read as a datastore. */
export const ringPath = (radius, y, points = 10) =>
    Array.from({ length: points }, (_, i) => {
        const a = (i / points) * Math.PI * 2;
        return [Math.cos(a) * radius, y, Math.sin(a) * radius];
    });
