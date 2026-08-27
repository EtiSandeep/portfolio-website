import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { profile } from "../data/profile";

// The curtain is decorative — the page behind it is already interactive — so it should
// clear as soon as it plausibly can rather than holding the visitor at the door.
const MIN_DURATION = 650;

/**
 * The first thing that happens is a name being written. Covers the moment while fonts
 * settle and the first shaders compile, then lifts.
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
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-paper dark:bg-board"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div aria-hidden="true" className="absolute inset-0 grain-overlay opacity-[0.16] dark:opacity-[0.22]" />

                    <div className="relative flex overflow-hidden font-hand text-3xl md:text-4xl font-bold text-ink dark:text-chalk">
                        {letters.map((char, i) => (
                            <motion.span
                                key={i}
                                initial={{ y: "60%", opacity: 0 }}
                                animate={{ y: "0%", opacity: 1 }}
                                transition={{ delay: 0.1 + i * 0.045, duration: 0.35, ease: "easeOut" }}
                                className={char === " " ? "w-2.5" : ""}
                            >
                                {char === " " ? " " : char}
                            </motion.span>
                        ))}
                    </div>

                    {/* The line struck under it, drawn left to right. */}
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 220 14"
                        className="relative mt-3 w-56 h-4 text-ink/70 dark:text-chalk/60"
                        fill="none"
                    >
                        <motion.path
                            d="M4 9 C46 3, 92 12, 138 6 S196 5, 216 9"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.3, duration: 0.9, ease: "easeInOut" }}
                        />
                    </svg>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
