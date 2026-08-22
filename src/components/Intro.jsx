import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { profile } from "../data/profile";

// The curtain is decorative — the page behind it is already interactive — so it should
// clear as soon as it plausibly can rather than holding the visitor at the door.
const MIN_DURATION = 650;

/**
 * Covers the first moment while fonts settle and the first shaders compile, then lifts
 * like a curtain. Purely cosmetic — the page underneath is already interactive.
 */
export default function Intro() {
    const [done, setDone] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const started = performance.now();

        const finish = () => {
            if (cancelled) return;
            const elapsed = performance.now() - started;
            const wait = Math.max(MIN_DURATION - elapsed, 0);
            setTimeout(() => !cancelled && setDone(true), wait);
        };

        const fonts = document.fonts?.ready ?? Promise.resolve();
        fonts.then(finish).catch(finish);

        // Never trap the visitor behind the curtain if something stalls.
        const bail = setTimeout(finish, 1400);
        return () => {
            cancelled = true;
            clearTimeout(bail);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = done ? "" : "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [done]);

    const letters = profile.name.split("");

    return (
        <AnimatePresence>
            {!done && (
                <motion.div
                    key="intro"
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-cream dark:bg-night"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: "blur(12px)" }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.div
                        className="relative w-24 h-24 mb-8"
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-coral via-tangerine to-gold dark:from-moon-indigo dark:via-moon-violet dark:to-moon-glow blur-xl opacity-70 animate-pulse" />
                        <div className="absolute inset-3 rounded-full border border-ink/10 dark:border-white/20" />
                        <motion.div
                            className="absolute inset-3 rounded-full border-t-2 border-coral dark:border-moon-glow"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                        />
                    </motion.div>

                    <div className="flex overflow-hidden font-display text-2xl md:text-3xl font-bold tracking-tight text-ink dark:text-moon-ink">
                        {letters.map((char, i) => (
                            <motion.span
                                key={i}
                                initial={{ y: "110%", opacity: 0 }}
                                animate={{ y: "0%", opacity: 1 }}
                                transition={{ delay: 0.15 + i * 0.035, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className={char === " " ? "w-2" : ""}
                            >
                                {char === " " ? " " : char}
                            </motion.span>
                        ))}
                    </div>

                    <motion.div
                        className="mt-6 h-px w-40 overflow-hidden bg-ink/10 dark:bg-white/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <motion.div
                            className="h-full bg-gradient-to-r from-coral via-tangerine to-gold dark:from-moon-indigo dark:via-moon-violet dark:to-moon-glow"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1.1, ease: "easeInOut" }}
                            style={{ originX: 0 }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
