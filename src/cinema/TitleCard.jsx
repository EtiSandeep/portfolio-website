import { motion } from "framer-motion";

/**
 * The main title.
 *
 * Cinematic motion is not smooth motion. Cards cut in on a beat, hold, and stop dead —
 * easing everything in and out is the language of a web page, not a title sequence. The one
 * exception is the name, which tracks in: letter-spacing collapsing from wide to set is the
 * oldest move in the form and still the best.
 */

/** A hard cut: no ramp, just present on the beat. */
const cut = (beat) => ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.001, delay: beat },
});

/** A wipe, for rules. */
const wipe = (beat) => ({
    initial: { scaleX: 0 },
    animate: { scaleX: 1 },
    transition: { duration: 0.5, delay: beat, ease: [0.16, 1, 0.3, 1] },
});

export default function TitleCard() {
    return (
        <div className="card">
            <motion.p {...cut(0.2)} className="card-above">
                A portfolio in six reels
            </motion.p>

            <motion.h1
                className="card-name"
                initial={{ opacity: 0, letterSpacing: "0.62em", filter: "blur(6px)" }}
                animate={{ opacity: 1, letterSpacing: "0.045em", filter: "blur(0px)" }}
                transition={{ duration: 1.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
                Sandeep Eti
            </motion.h1>

            <motion.span {...wipe(1.2)} className="card-rule" aria-hidden="true" />

            <motion.p {...cut(1.45)} className="card-role">
                Principal Engineer <em>·</em> Solution Architect
            </motion.p>

            <motion.p {...cut(1.7)} className="card-stack">
                .NET platforms <em>—</em> cloud infrastructure <em>—</em> the AI systems layered on top
            </motion.p>

            <motion.div {...cut(2.0)} className="card-actions">
                <a className="key" href="#work">View the work</a>
                <a className="key key--ghost" href="#contact">Get in touch</a>
            </motion.div>
        </div>
    );
}
