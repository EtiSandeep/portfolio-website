import { motion } from "framer-motion";
import { ArrowRight, Moon, MousePointer2, Sun } from "lucide-react";
import { profile } from "../data/profile";
import { useTheme } from "../context/ThemeContext";

const rise = (delay) => ({
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] },
});

const marks = [
    { value: "7+", label: "years shipping" },
    { value: "15+", label: "systems delivered" },
    { value: "∞", label: "things left to build" },
];

const Hero = () => {
    const { theme } = useTheme();
    const isSun = theme === "sun";

    return (
        <section id="home" className="relative min-h-screen flex items-center px-5 sm:px-8 pt-24 pb-28">
            <div className="w-full max-w-6xl mx-auto">
                <div className="copy-scrim w-full lg:mr-auto lg:max-w-[52%]">
                    <motion.div {...rise(0)} className="section-eyebrow mb-7">
                        {isSun
                            ? <Sun size={13} className="text-tangerine" />
                            : <Moon size={13} className="text-moon-glow" />}
                        Hey, I&apos;m Sandeep
                    </motion.div>

                    <motion.h1
                        {...rise(0.08)}
                        className="font-display text-[2.05rem] leading-[1.06] sm:text-5xl lg:text-7xl font-bold tracking-tight mb-5 sm:mb-7 text-ink dark:text-moon-ink"
                    >
                        I build{" "}
                        <span className="gradient-text">AI-powered systems</span>{" "}
                        that feel effortless.
                    </motion.h1>

                    <motion.p
                        {...rise(0.18)}
                        className="text-[15px] sm:text-lg lg:text-xl text-ink/80 dark:text-moon-ink-soft max-w-xl mb-7 sm:mb-9 leading-relaxed"
                    >
                        {profile.headline} — {profile.subHeadline}.
                    </motion.p>

                    <motion.div {...rise(0.28)} className="flex flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-12">
                        <a
                            href="#projects"
                            className="px-6 sm:px-7 py-3.5 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-coral to-tangerine hover:from-tangerine hover:to-coral dark:from-moon-indigo dark:to-moon-violet dark:hover:from-moon-violet dark:hover:to-moon-indigo text-white font-semibold rounded-full flex items-center gap-2 transition-all shadow-lg shadow-coral/30 dark:shadow-moon-indigo/40 hover:shadow-xl hover:shadow-coral/40 hover:-translate-y-0.5"
                        >
                            See my work <ArrowRight size={18} />
                        </a>
                        <a
                            href="#contact"
                            className="px-6 sm:px-7 py-3.5 sm:py-4 text-sm sm:text-base glass-card rounded-full text-ink dark:text-moon-ink font-semibold hover:-translate-y-0.5 transition-transform"
                        >
                            Say hello
                        </a>
                    </motion.div>

                    <motion.dl {...rise(0.38)} className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-5">
                        {marks.map((mark) => (
                            <div key={mark.label}>
                                <dt className="sr-only">{mark.label}</dt>
                                <dd className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-moon-ink leading-none">
                                    {mark.value}
                                </dd>
                                <p className="mt-1.5 text-[10px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-[0.15em] text-ink/70 dark:text-moon-ink-soft">
                                    {mark.label}
                                </p>
                            </div>
                        ))}
                    </motion.dl>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute bottom-10 right-5 sm:right-9 hidden sm:flex flex-col items-center gap-3 text-ink-soft dark:text-moon-ink-soft pointer-events-none"
            >
                <MousePointer2 size={14} className="rotate-180" />
                <span className="text-[10px] uppercase tracking-[0.28em] [writing-mode:vertical-rl]">
                    Scroll to travel
                </span>
                <motion.span
                    className="w-px h-12 bg-gradient-to-b from-coral to-transparent dark:from-moon-violet"
                    animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ originY: 0 }}
                />
            </motion.div>
        </section>
    );
};

export default Hero;
