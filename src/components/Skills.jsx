import React from "react";
import { motion } from "framer-motion";
import { profile } from "../data/profile";
import { Cpu } from "lucide-react";

const Skills = () => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, scale: 0.8 },
        show: { opacity: 1, scale: 1 }
    };

    return (
        <section id="skills" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl font-bold inline-flex items-center gap-3 mb-4 text-ink">
                        <Cpu className="text-tangerine" /> Technical Arsenal
                    </h2>
                    <p className="text-ink-soft max-w-2xl mx-auto">
                        A comprehensive set of tools and technologies I've mastered to build scalable, enterprise-grade solutions.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    {profile.skills.map((skill, index) => (
                        <motion.div
                            key={index}
                            variants={item}
                            whileHover={{ scale: 1.08, translateY: -4 }}
                            className="px-6 py-3 bg-white/70 border border-white/80 rounded-full hover:border-transparent hover:bg-gradient-to-r hover:from-coral hover:to-tangerine hover:shadow-lg hover:shadow-coral/30 transition-all cursor-default group"
                        >
                            <span className="text-ink font-medium group-hover:text-white transition-colors">{skill}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Skills;
