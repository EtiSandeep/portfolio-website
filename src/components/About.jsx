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
        <section id="about" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6" ref={ref}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h2 className="font-display text-4xl font-bold mb-6 flex items-center gap-3 text-ink">
                            <span className="w-12 h-1.5 rounded-full bg-gradient-to-r from-coral to-gold"></span>
                            About Me
                        </h2>
                        <p className="text-xl text-ink leading-relaxed mb-6">
                            {profile.about}
                        </p>
                        <p className="text-ink-soft leading-relaxed mb-8">
                            I specialize in architecting scalable, high-performance systems. My passion lies in bridging the gap between complex infrastructure and seamless user experiences, leveraging the power of modern Cloud and AI technologies.
                        </p>

                        <a href="#contact" className="text-coral font-semibold hover:text-tangerine transition-colors flex items-center gap-2 group">
                            Let's connect
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                                className="p-6 bg-white/60 backdrop-blur-sm border border-white/80 rounded-3xl hover:bg-white/90 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-tangerine/20 group"
                            >
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-coral to-gold text-white flex items-center justify-center mb-4 shadow-md shadow-coral/30 group-hover:scale-110 transition-transform">
                                    {stat.icon}
                                </div>
                                <h3 className="text-3xl font-bold text-ink mb-1 font-display">{stat.value}</h3>
                                <p className="text-sm text-ink-soft">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
