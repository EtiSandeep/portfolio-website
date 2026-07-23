import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { profile } from "../data/profile";
import { Folder, ExternalLink, Github } from "lucide-react";

// 3D Tilt Card Component
const ProjectCard = ({ project }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

    const handleMouseMove = (e) => {
        const rect = e.target.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative group h-full"
        >
            <div
                style={{ transform: "translateZ(60px)", transformStyle: "preserve-3d" }}
                className="absolute inset-4 rounded-2xl bg-gradient-to-br from-coral/40 to-gold/40 dark:from-moon-indigo/50 dark:to-moon-glow/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>

            <div
                style={{ transform: "translateZ(40px)" }}
                className="relative h-full bg-white/70 dark:bg-night-paper/70 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-3xl p-8 flex flex-col hover:border-coral/40 dark:hover:border-moon-violet/40 hover:bg-white/90 dark:hover:bg-night-paper/90 transition-colors shadow-xl shadow-tangerine/10 dark:shadow-moon-indigo/10"
            >
                <div className="flex justify-between items-start mb-6 relative z-50">
                    <div className="p-3 bg-gradient-to-br from-coral to-gold dark:from-moon-indigo dark:to-moon-violet rounded-xl text-white shadow-md shadow-coral/30 dark:shadow-moon-indigo/40">
                        <Folder size={24} />
                    </div>
                    <div className="flex gap-3 relative z-50 pointer-events-auto">
                        <a href="#" className="text-ink-soft dark:text-moon-ink-soft hover:text-ink dark:hover:text-moon-ink transition-colors p-1" title="View Code">
                            <Github size={20} />
                        </a>
                        <a href="#" className="text-ink-soft dark:text-moon-ink-soft hover:text-ink dark:hover:text-moon-ink transition-colors p-1" title="Live Demo">
                            <ExternalLink size={20} />
                        </a>
                    </div>
                </div>

                <h3 className="text-2xl font-bold font-display text-ink dark:text-moon-ink mb-3 group-hover:text-coral dark:group-hover:text-moon-glow transition-all duration-300">
                    {project.title}
                </h3>

                <p className="text-ink-soft dark:text-moon-ink-soft mb-6 flex-grow leading-relaxed">
                    {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                    {project.technologies.map((tech, i) => (
                        <span key={i} className="text-xs font-semibold px-3 py-1.5 bg-paper dark:bg-night rounded-full text-ink-soft dark:text-moon-ink-soft border border-ink/5 dark:border-white/10">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const Projects = () => {
    return (
        <section id="projects" className="py-24 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl font-bold inline-flex items-center gap-3 text-ink dark:text-moon-ink">
                        Selected Works
                    </h2>
                    <p className="mt-4 text-ink-soft dark:text-moon-ink-soft">Innovation through architecture and code.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
                    {profile.projects.map((project, index) => (
                        <ProjectCard key={index} project={project} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Projects;
