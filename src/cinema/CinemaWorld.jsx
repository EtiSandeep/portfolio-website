import Beams from "./Beams";
import Dust from "./Dust";

/** The shot: a lit volume with air in it. Nothing else, yet. */
export default function CinemaWorld({ quality }) {
    const { motion, particles, dpr } = quality;
    const pixelRatio = Array.isArray(dpr) ? dpr[1] : 1.5;

    return (
        <>
            <Beams motion={motion} />
            <Dust count={particles} motion={motion} pixelRatio={pixelRatio} />
        </>
    );
}
