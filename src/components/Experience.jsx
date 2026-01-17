import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { profile } from "../data/profile";
import { Briefcase } from "lucide-react";

const ExperienceCard = ({ exp, index }) => {
    const isLeft = index % 2 === 0;

    return (
        <div className={`mb-8 flex justify-between items-center w-full ${isLeft ? "flex-row-reverse" : "flex-row"}`}>

            {/* Empty space/Spacer */}
            <div className="hidden md:block w-[45%]"></div>

            {/* Timeline Node (Absolute Center) */}
            <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-dark border-4 border-blue-500 z-20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>

            {/* Card Content */}
            <motion.div
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full md:w-[45%]"
            >
                <div className={`p-6 bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-xl hover:border-blue-500/50 transition-all duration-300 shadow-xl group ${isLeft ? "text-right" : "text-left"}`}>
                    <span className="text-blue-400 font-mono text-xs mb-2 block tracking-wider uppercase font-bold">{exp.period}</span>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{exp.role}</h3>
                    <h4 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2 justify-end">
                        {isLeft ? <>{exp.company} <span className="w-2 h-2 rounded-full bg-blue-500/50"></span></> : <><span className="w-2 h-2 rounded-full bg-blue-500/50"></span> {exp.company}</>}
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed opacity-80">{exp.description}</p>
                </div>
            </motion.div>
        </div>
    );
};

const Experience = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

    return (
        <section id="experience" className="py-24 bg-dark relative overflow-hidden" ref={ref}>
            {/* Decorative Background Elements */}
            <div className="absolute top-1/4 left-0 w-64 h-64 bg-blue-900/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-purple-900/10 rounded-full blur-[100px]"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold inline-flex items-center gap-3">
                        <Briefcase className="text-blue-500" /> Professional Journey
                    </h2>
                </div>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-800 -translate-x-1/2"></div>

                    {/* Animated Line Fill */}
                    <motion.div
                        style={{ scaleY, originY: 0 }}
                        className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 -translate-x-1/2 z-10"
                    ></motion.div>

                    <div className="py-10">
                        {profile.experience.map((exp, index) => (
                            <ExperienceCard key={index} exp={exp} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Experience;
