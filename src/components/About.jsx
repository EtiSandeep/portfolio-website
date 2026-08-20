import { motion } from "framer-motion";
import { Code, Cpu, Server, User } from "lucide-react";
import Section from "./Section";
import { profile } from "../data/profile";

const stats = [
    { label: "Years Exp.", value: "7+", icon: User },
    { label: "Projects", value: "15+", icon: Code },
    { label: "Tech Stack", value: "20+", icon: Server },
    { label: "Solutions", value: "∞", icon: Cpu },
];

const About = () => (
    <Section id="about" align="right">
        <div className="glass-panel p-7 sm:p-9">
            <span className="section-eyebrow mb-6">01 — About</span>

            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-5 text-ink dark:text-moon-ink">
                Architecture you can <span className="gradient-text">feel</span>.
            </h2>

            <p className="text-[17px] text-ink dark:text-moon-ink leading-relaxed mb-4">
                {profile.about}
            </p>
            <p className="text-[15px] text-ink-soft dark:text-moon-ink-soft leading-relaxed mb-7">
                I specialise in scalable, high-performance systems — bridging complex infrastructure
                and seamless user experience with modern cloud and AI.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-7">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                            className="glass-card p-4 hover:-translate-y-1 transition-transform"
                        >
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ember to-rust dark:from-moon-indigo dark:to-moon-violet-deep text-white flex items-center justify-center mb-3 shadow-md shadow-coral/30 dark:shadow-moon-indigo/40">
                                <Icon size={17} />
                            </div>
                            <p className="text-2xl font-bold text-ink dark:text-moon-ink font-display leading-none">
                                {stat.value}
                            </p>
                            <p className="mt-1.5 text-xs text-ink-soft dark:text-moon-ink-soft">{stat.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            <a
                href="#contact"
                className="text-ember dark:text-moon-glow font-semibold hover:text-rust dark:hover:text-moon-violet transition-colors inline-flex items-center gap-2 group"
            >
                Let&apos;s connect
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
        </div>
    </Section>
);

export default About;
