import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { profile } from "../data/profile";
import { User, Code, Server, Cpu } from "lucide-react";

const About = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const stats = [
        { label: "Years Exp.", value: "7+", icon: <User /> },
        { label: "Projects", value: "15+", icon: <Code /> },
        { label: "Tech Stack", value: "20+", icon: <Server /> },
        { label: "Solutions", value: "∞", icon: <Cpu /> },
    ];

    return (
        <section id="about" className="py-24 bg-dark relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

            <div className="max-w-7xl mx-auto px-6" ref={ref}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h2 className="text-4xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-12 h-1 bg-blue-500 rounded-full"></span>
                            About Me
                        </h2>
                        <p className="text-xl text-gray-300 leading-relaxed mb-6">
                            {profile.about}
                        </p>
                        <p className="text-gray-400 leading-relaxed mb-8">
                            I specialize in architecting scalable, high-performance systems. My passion lies in bridging the gap between complex infrastructure and seamless user experiences, leveraging the power of modern Cloud and AI technologies.
                        </p>

                        <a href="#contact" className="text-blue-400 font-medium hover:text-blue-300 transition-colors flex items-center gap-2 group">
                            Let's connect
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </motion.div>

                    {/* Stats Grid - "Hard" Animation: staggering cards */}
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                                className="p-6 bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl hover:bg-gray-800/80 transition-all hover:scale-105 group"
                            >
                                <div className="text-blue-500 mb-3 group-hover:text-purple-400 transition-colors">
                                    {stat.icon}
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                                <p className="text-sm text-gray-400">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
