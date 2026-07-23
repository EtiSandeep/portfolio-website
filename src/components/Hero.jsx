import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Sun, Moon } from "lucide-react";
import { profile } from "../data/profile";
import { useTheme } from "../context/ThemeContext";

const badges = [
    { label: "7+ yrs experience", style: "top-2 -left-6 md:-left-10" },
    { label: "AI-Integrated Systems", style: "top-1/2 -right-8 md:-right-14 -translate-y-1/2" },
    { label: ".NET & Cloud Architect", style: "bottom-4 -left-4 md:-left-8" },
];

const Hero = () => {
    const { theme } = useTheme();
    const isSun = theme === "sun";

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
            <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

                {/* Main Content - Left */}
                <div className="lg:col-span-7 text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/60 dark:bg-night-paper/60 border border-white/80 dark:border-white/10 backdrop-blur-sm shadow-sm font-sans text-sm font-medium text-ink-soft dark:text-moon-ink-soft"
                    >
                        {isSun
                            ? <Sun size={16} className="text-tangerine" />
                            : <Moon size={16} className="text-moon-glow" />}
                        Hey, I&apos;m Sandeep
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6 text-ink dark:text-moon-ink leading-[1.05]"
                    >
                        I build{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-coral via-tangerine to-gold dark:from-moon-indigo dark:via-moon-violet dark:to-moon-glow">
                            AI-powered systems
                        </span>{" "}
                        that feel effortless.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-lg md:text-xl text-ink-soft dark:text-moon-ink-soft max-w-xl mb-10 leading-relaxed"
                    >
                        {profile.headline} — {profile.subHeadline}.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap gap-4"
                    >
                        <a
                            href="#projects"
                            className="px-7 py-4 bg-gradient-to-r from-coral to-tangerine hover:from-tangerine hover:to-coral dark:from-moon-indigo dark:to-moon-violet dark:hover:from-moon-violet dark:hover:to-moon-indigo text-white font-semibold rounded-full flex items-center gap-2 transition-all shadow-lg shadow-coral/30 dark:shadow-moon-indigo/40 hover:shadow-xl hover:shadow-coral/40 dark:hover:shadow-moon-indigo/50 hover:-translate-y-0.5"
                        >
                            See my work <ArrowRight size={18} />
                        </a>
                        <a
                            href="#contact"
                            className="px-7 py-4 bg-white/60 dark:bg-night-paper/60 border border-white/80 dark:border-white/10 hover:bg-white dark:hover:bg-night-paper text-ink dark:text-moon-ink font-semibold rounded-full transition-all backdrop-blur-sm"
                        >
                            Say hello
                        </a>
                    </motion.div>
                </div>

                {/* Decorative orb + floating badges - Right */}
                <div className="lg:col-span-5 hidden lg:flex justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                        className="relative w-80 h-80"
                    >
                        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-coral via-tangerine to-gold dark:from-moon-indigo dark:via-moon-violet dark:to-moon-glow opacity-90 shadow-2xl shadow-coral/40 dark:shadow-moon-indigo/50 animate-float" />
                        <div className="absolute inset-8 rounded-[2rem] bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/20 flex items-center justify-center animate-float-delayed">
                            {isSun
                                ? <Sparkles size={56} className="text-white drop-shadow" />
                                : <Moon size={56} className="text-white drop-shadow" />}
                        </div>

                        {badges.map((badge, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 + i * 0.15, type: "spring" }}
                                className={`absolute ${badge.style} px-4 py-2 bg-white/80 dark:bg-night-paper/80 backdrop-blur-md border border-white dark:border-white/10 shadow-lg rounded-2xl text-xs font-semibold text-ink dark:text-moon-ink whitespace-nowrap animate-float`}
                            >
                                {badge.label}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
