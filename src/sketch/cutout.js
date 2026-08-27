/**
 * Separates the figure in a photograph from the backdrop it was shot against.
 *
 * A brightness threshold cannot do this job. In a typical studio portrait the backdrop and
 * the lit parts of the subject — a hand, light trousers, a shirt catching the key — land on
 * the same luminance, so anything that drops "the bright pixels" takes half the person with
 * it.
 *
 * What actually distinguishes a backdrop is that it is flat and it touches the edge of the
 * frame. So: flood inward from the border, walking only across pixels that stay near the
 * border's own colour AND sit in a smooth region. The colour test lets the flood follow the
 * gradient of a lit backdrop or a rim-light halo; the smoothness test stops it dead at the
 * subject's contour, which is the one place the image has a real edge. Enclosed bright areas
 * are never reached, because the flood cannot get to them without crossing that contour.
 */

/** Luminance and Sobel gradient magnitude for every pixel. */
const analyse = (data, w, h) => {
    const lum = new Float32Array(w * h);
    for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
        lum[i] = (0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]) / 255;
    }

    const grad = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const i = y * w + x;
            const tl = lum[i - w - 1], t = lum[i - w], tr = lum[i - w + 1];
            const l = lum[i - 1], r = lum[i + 1];
            const bl = lum[i + w - 1], b = lum[i + w], br = lum[i + w + 1];
            const gx = -tl - 2 * l - bl + tr + 2 * r + br;
            const gy = tl + 2 * t + tr - bl - 2 * b - br;
            grad[i] = Math.hypot(gx, gy);
        }
    }

    return { lum, grad };
};

/** The backdrop's own colour, taken as the median of the frame's border. */
const borderMedian = (lum, w, h) => {
    const edge = [];
    for (let x = 0; x < w; x++) {
        edge.push(lum[x], lum[(h - 1) * w + x]);
    }
    for (let y = 0; y < h; y++) {
        edge.push(lum[y * w], lum[y * w + w - 1]);
    }
    edge.sort((a, b) => a - b);
    return edge[edge.length >> 1];
};

/**
 * Returns a Uint8Array, one byte per pixel: 255 where the subject is, 0 where the backdrop
 * is, with a soft border between. Returns null when the result is not believable — a photo
 * shot against a busy background floods either almost everything or almost nothing, and in
 * that case the caller is better off not cutting anything out at all.
 */
export function buildSubjectMask(data, w, h, { tolerance = 0.22, edgeStop = 0.55, dilate = 2 } = {}) {
    const { lum, grad } = analyse(data, w, h);
    const bg = borderMedian(lum, w, h);

    // Flood inward from every border pixel.
    const isBackdrop = new Uint8Array(w * h);
    const stack = [];
    const push = (i) => {
        if (isBackdrop[i]) return;
        if (Math.abs(lum[i] - bg) > tolerance) return;
        if (grad[i] > edgeStop) return;
        isBackdrop[i] = 1;
        stack.push(i);
    };

    for (let x = 0; x < w; x++) {
        push(x);
        push((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
        push(y * w);
        push(y * w + w - 1);
    }

    while (stack.length) {
        const i = stack.pop();
        const x = i % w;
        if (x > 0) push(i - 1);
        if (x < w - 1) push(i + 1);
        if (i >= w) push(i - w);
        if (i < w * (h - 1)) push(i + w);
    }

    let covered = 0;
    for (let i = 0; i < isBackdrop.length; i++) covered += isBackdrop[i];
    const fraction = covered / isBackdrop.length;
    if (fraction < 0.06 || fraction > 0.94) return null;

    // Grow the subject back out a little. The contour the flood stopped at belongs to the
    // figure, and losing it would cost exactly the line a pen would have drawn hardest.
    let mask = new Uint8Array(w * h);
    for (let i = 0; i < mask.length; i++) mask[i] = isBackdrop[i] ? 0 : 255;
    for (let pass = 0; pass < dilate; pass++) mask = grow(mask, w, h);

    return feather(mask, w, h);
}

/** One pass of 4-neighbour dilation. */
const grow = (mask, w, h) => {
    const out = new Uint8Array(mask);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = y * w + x;
            if (mask[i]) continue;
            const near =
                (x > 0 && mask[i - 1]) ||
                (x < w - 1 && mask[i + 1]) ||
                (y > 0 && mask[i - w]) ||
                (y < h - 1 && mask[i + w]);
            if (near) out[i] = 255;
        }
    }
    return out;
};

/** Two box blurs, so the silhouette hands over to the paper instead of cutting. */
const feather = (mask, w, h) => {
    let src = mask;
    for (let pass = 0; pass < 2; pass++) {
        const out = new Uint8Array(w * h);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let sum = 0;
                let n = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    const yy = y + dy;
                    if (yy < 0 || yy >= h) continue;
                    for (let dx = -1; dx <= 1; dx++) {
                        const xx = x + dx;
                        if (xx < 0 || xx >= w) continue;
                        sum += src[yy * w + xx];
                        n++;
                    }
                }
                out[y * w + x] = sum / n;
            }
        }
        src = out;
    }
    return src;
};

/** Longest edge the mask is computed at. Finer than this buys nothing a pen would show. */
export const MASK_SIZE = 560;
