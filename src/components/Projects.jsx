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

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

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
                style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
                className="absolute inset-4 rounded-xl bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>

            <div
                style={{ transform: "translateZ(50px)" }}
                className="relative h-full bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col hover:border-purple-500/50 transition-colors shadow-2xl"
            >
                <div className="flex justify-between items-start mb-6 relative z-50">
                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                        <Folder size={24} />
                    </div>
                    <div className="flex gap-3 relative z-50 pointer-events-auto">
                        <a href="#" className="text-gray-500 hover:text-white transition-colors p-1" title="View Code">
                            <Github size={20} />
                        </a>
                        <a href="#" className="text-gray-500 hover:text-white transition-colors p-1" title="Live Demo">
                            <ExternalLink size={20} />
                        </a>
                    </div>
                </div>

                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-3 group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
                    {project.title}
                </h3>

                <p className="text-gray-400 mb-6 flex-grow leading-relaxed">
                    {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                    {project.technologies.map((tech, i) => (
                        <span key={i} className="text-xs font-mono font-medium px-2 py-1 bg-gray-800 rounded text-gray-300 border border-gray-700">
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
        <section id="projects" className="py-24 bg-dark">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold inline-flex items-center gap-3">
                        Selected Works
                    </h2>
                    <p className="mt-4 text-gray-400">Innovation through architecture and code.</p>
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
