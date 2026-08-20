import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import Section from "./Section";
import { profile } from "../data/profile";

const Experience = () => (
    <Section id="experience" align="left">
        <div className="glass-panel p-7 sm:p-9">
            <span className="section-eyebrow mb-5">02 — Journey</span>

            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6 text-ink dark:text-moon-ink flex items-center gap-3">
                <Briefcase className="text-ember dark:text-moon-glow" size={28} />
                Professional Journey
            </h2>

            <ol className="relative pl-7">
                {/* The rail mirrors the lit spiral turning alongside this panel. */}
                <span
                    aria-hidden="true"
                    className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-coral via-tangerine to-transparent dark:from-moon-violet dark:via-moon-glow"
                />

                {profile.experience.map((exp, i) => (
                    <motion.li
                        key={`${exp.role}-${exp.period}`}
                        initial={{ opacity: 0, x: -18 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.5, delay: i * 0.06 }}
                        className="relative pb-5 last:pb-0"
                    >
                        <span
                            aria-hidden="true"
                            className="absolute -left-7 top-2 w-[11px] h-[11px] rounded-full bg-gradient-to-br from-coral to-gold dark:from-moon-violet dark:to-moon-glow ring-4 ring-cream/70 dark:ring-night/70"
                        />
                        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                            <h3 className="font-display text-base font-bold text-ink dark:text-moon-ink">
                                {exp.role}
                            </h3>
                            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ember dark:text-moon-glow">
                                {exp.period}
                            </span>
                        </div>
                        <p className="mt-1 text-[13px] text-ink-soft dark:text-moon-ink-soft leading-relaxed">
                            {exp.description}
                        </p>
                    </motion.li>
                ))}
            </ol>
        </div>
    </Section>
);

export default Experience;
