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
        <section id="skills" className="py-24 bg-dark relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold inline-flex items-center gap-3 mb-4">
                        <Cpu className="text-purple-500" /> Technical Arsenal
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
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
                            whileHover={{ scale: 1.1, translateY: -5 }}
                            className="px-6 py-3 bg-gray-900/80 border border-gray-800 rounded-full hover:border-purple-500/50 hover:bg-purple-900/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-default"
                        >
                            <span className="text-gray-300 font-medium">{skill}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Skills;
