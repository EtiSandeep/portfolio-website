import { motion } from "framer-motion";
import { ExternalLink, Github, Lock } from "lucide-react";
import Section from "./Section";
import { profile } from "../data/profile";

const ProjectRow = ({ project, index }) => (
    <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
        className="card p-5 group"
    >
        <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-start gap-3">
                {/* The number, written in the corner the way you number a sketch. */}
                <span className="mt-0.5 shrink-0 font-hand text-lg font-bold text-accent dark:text-chalk-accent">
                    {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-hand text-xl font-bold text-ink dark:text-chalk">
                    {project.title}
                </h3>
            </div>

            <div className="flex gap-2 shrink-0 pt-1">
                {project.github && (
                    <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View code"
                        className="text-ink-soft dark:text-chalk-soft hover:text-accent dark:hover:text-chalk-accent transition-colors"
                    >
                        <Github size={18} />
                    </a>
                )}
                {project.demo && (
                    <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Live demo"
                        className="text-ink-soft dark:text-chalk-soft hover:text-accent dark:hover:text-chalk-accent transition-colors"
                    >
                        <ExternalLink size={18} />
                    </a>
                )}
                {!project.github && !project.demo && (
                    <span title="Private project" className="text-ink-soft/70 dark:text-chalk-soft/70">
                        <Lock size={15} />
                    </span>
                )}
            </div>
        </div>

        <p className="text-[13.5px] text-ink-soft dark:text-chalk-soft leading-relaxed mb-4">
            {project.description}
        </p>

        <ul className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
                <li key={tech} className="ink-chip">
                    {tech}
                </li>
            ))}
        </ul>
    </motion.article>
);

const Projects = () => (
    <Section id="projects" align="left">
        <div className="mb-7">
            <span className="margin-note mb-4">04 — pinned up</span>
            <h2 className="font-hand text-3xl sm:text-4xl font-bold text-ink dark:text-chalk">
                Selected <span className="underscored">works</span>.
            </h2>
            <p className="mt-3 text-ink-soft dark:text-chalk-soft">
                Four boards on the wall. These are the ones still up.
            </p>
        </div>

        <div className="space-y-4">
            {profile.projects.map((project, i) => (
                <ProjectRow key={project.title} project={project} index={i} />
            ))}
        </div>
    </Section>
);

export default Projects;
