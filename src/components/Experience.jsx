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
            <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-cream border-4 border-coral z-20 flex items-center justify-center shadow-[0_0_15px_rgba(255,107,107,0.4)]">
                <div className="w-2 h-2 bg-gradient-to-br from-coral to-gold rounded-full"></div>
            </div>

            {/* Card Content */}
            <motion.div
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full md:w-[45%]"
            >
                <div className={`p-6 bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl hover:border-coral/40 hover:bg-white/90 transition-all duration-300 shadow-lg shadow-tangerine/5 hover:shadow-xl hover:shadow-coral/20 group ${isLeft ? "text-right" : "text-left"}`}>
                    <span className="text-coral font-semibold text-xs mb-2 block tracking-wider uppercase">{exp.period}</span>
                    <h3 className="text-xl font-bold text-ink mb-1 font-display group-hover:text-coral transition-colors">{exp.role}</h3>
                    <h4 className="text-sm font-semibold text-ink-soft mb-4 flex items-center gap-2 justify-end">
                        {isLeft ? <>{exp.company} <span className="w-2 h-2 rounded-full bg-tangerine"></span></> : <><span className="w-2 h-2 rounded-full bg-tangerine"></span> {exp.company}</>}
                    </h4>
                    <p className="text-ink-soft text-sm leading-relaxed">{exp.description}</p>
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
        <section id="experience" className="py-24 relative overflow-hidden" ref={ref}>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="font-display text-4xl font-bold inline-flex items-center gap-3 text-ink">
                        <Briefcase className="text-coral" /> Professional Journey
                    </h2>
                </div>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-ink/10 -translate-x-1/2"></div>

                    {/* Animated Line Fill */}
                    <motion.div
                        style={{ scaleY, originY: 0 }}
                        className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-coral via-tangerine to-gold -translate-x-1/2 z-10"
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
