import { motion } from "framer-motion";
import { ArrowRight, Moon, MousePointer2, Sun } from "lucide-react";
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
                    <motion.p {...rise(0)} className="margin-note mb-4 sm:mb-6">
                        {isSun
                            ? <Sun size={15} className="text-accent-warm dark:text-chalk-warm" />
                            : <Moon size={15} className="text-chalk-warm" />}
                        Hey, I&apos;m Sandeep
                    </motion.p>

                    <motion.h1
                        {...rise(0.08)}
                        className="font-hand text-[1.8rem] leading-[1.25] sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 sm:mb-9 text-ink dark:text-chalk"
                    >
                        I build{" "}
                        <span className="ringed whitespace-nowrap">AI‑powered systems</span>{" "}
                        that feel effortless.
                    </motion.h1>

                    <motion.p
                        {...rise(0.18)}
                        className="text-[15px] sm:text-lg text-ink-soft dark:text-chalk-soft max-w-xl mb-6 sm:mb-9 leading-relaxed"
                    >
                        Principal Engineer and Solution Architect, building enterprise .NET
                        platforms, cloud infrastructure and the AI systems layered on top.
                    </motion.p>

                    <motion.div {...rise(0.28)} className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-12">
                        <a href="#projects" className="ink-btn ink-btn--filled w-full sm:w-auto">
                            See my work <ArrowRight size={18} />
                        </a>
                        <a href="#contact" className="ink-btn w-full sm:w-auto">
                            Say hello
                        </a>
                    </motion.div>

                    <motion.dl {...rise(0.38)} className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-x-10 sm:gap-y-5">
                        {marks.map((mark) => (
                            <div key={mark.label}>
                                <dt className="sr-only">{mark.label}</dt>
                                <dd className="font-hand text-3xl sm:text-4xl font-bold text-ink dark:text-chalk leading-none">
                                    {mark.value}
                                </dd>
                                <p className="mt-2 text-[11px] sm:text-xs text-ink-soft dark:text-chalk-soft">
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
                className="absolute bottom-10 right-5 sm:right-9 hidden sm:flex flex-col items-center gap-3 text-ink-soft dark:text-chalk-soft pointer-events-none"
            >
                <MousePointer2 size={14} className="rotate-180" />
                <span className="font-hand text-sm [writing-mode:vertical-rl]">
                    scroll — it keeps drawing
                </span>
                <motion.span
                    aria-hidden="true"
                    className="w-px h-12 bg-ink/50 dark:bg-chalk/45"
                    animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ originY: 0 }}
                />
            </motion.div>
        </section>
    );
};

export default Hero;
