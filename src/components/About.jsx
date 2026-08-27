import { motion } from "framer-motion";
import { Code, Cpu, Server, User } from "lucide-react";
import Section from "./Section";
import { profile } from "../data/profile";

const stats = [
    { label: "years exp.", value: "7+", icon: User },
    { label: "projects", value: "15+", icon: Code },
    { label: "tech stack", value: "20+", icon: Server },
    { label: "solutions", value: "∞", icon: Cpu },
];

const About = () => (
    <Section id="about" align="right">
        <div className="sheet p-7 sm:p-9">
            <span className="margin-note mb-6">01 — about</span>

            <h2 className="font-hand text-3xl sm:text-4xl font-bold mb-5 text-ink dark:text-chalk">
                Architecture you can <span className="underscored">feel</span>.
            </h2>

            <p className="text-[17px] text-ink dark:text-chalk leading-relaxed mb-4">
                {profile.about}
            </p>
            <p className="text-[15px] text-ink-soft dark:text-chalk-soft leading-relaxed mb-7">
                I specialise in scalable, high-performance systems — bridging complex infrastructure
                and seamless user experience with modern cloud and AI.
            </p>

            <div className="grid grid-cols-2 gap-3.5 mb-8">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                            className="card p-4"
                        >
                            <Icon size={18} className="mb-3 text-accent dark:text-chalk-accent" />
                            <p className="font-hand text-3xl font-bold text-ink dark:text-chalk leading-none">
                                {stat.value}
                            </p>
                            <p className="mt-2 font-hand text-sm text-ink-soft dark:text-chalk-soft">
                                {stat.label}
                            </p>
                        </motion.div>
                    );
                })}
            </div>

            <a
                href="#contact"
                className="font-hand text-lg text-accent dark:text-chalk-accent inline-flex items-center gap-2 group underscored"
            >
                Let&apos;s connect
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
        </div>
    </Section>
);

export default About;
