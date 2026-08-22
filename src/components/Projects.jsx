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
        className="glass-card p-5 hover:-translate-y-1 transition-transform group"
    >
        <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 font-display text-xs font-bold text-white w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-ember to-rust dark:from-moon-indigo dark:to-moon-violet-deep shadow-md shadow-coral/30 dark:shadow-moon-indigo/40">
                    {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-lg font-bold text-ink dark:text-moon-ink group-hover:text-ember dark:group-hover:text-moon-glow transition-colors">
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
                        className="text-ink-soft dark:text-moon-ink-soft hover:text-ember dark:hover:text-moon-glow transition-colors"
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
                        className="text-ink-soft dark:text-moon-ink-soft hover:text-ember dark:hover:text-moon-glow transition-colors"
                    >
                        <ExternalLink size={18} />
                    </a>
                )}
                {!project.github && !project.demo && (
                    <span title="Private project" className="text-ink-soft/60 dark:text-moon-ink-soft/60">
                        <Lock size={15} />
                    </span>
                )}
            </div>
        </div>

        <p className="text-[13px] text-ink-soft dark:text-moon-ink-soft leading-relaxed mb-3.5">
            {project.description}
        </p>

        <ul className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
                <li
                    key={tech}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-ink-soft dark:text-moon-ink-soft border border-ink/10 dark:border-white/10 bg-white/40 dark:bg-white/5"
                >
                    {tech}
                </li>
            ))}
        </ul>
    </motion.article>
);

const Projects = () => (
    <Section id="projects" align="left">
        <div className="mb-6">
            <span className="section-eyebrow mb-4">04 — Work</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink dark:text-moon-ink">
                Selected <span className="gradient-text">Works</span>
            </h2>
            <p className="mt-2.5 text-ink-soft dark:text-moon-ink-soft">
                Innovation through architecture and code.
            </p>
        </div>

        <div className="space-y-3.5">
            {profile.projects.map((project, i) => (
                <ProjectRow key={project.title} project={project} index={i} />
            ))}
        </div>
    </Section>
);

export default Projects;
