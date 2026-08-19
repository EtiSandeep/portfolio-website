import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { profile } from "../data/profile";
import { useScene } from "../context/SceneContext";

/**
 * The constellation in the canvas is the real content here, so this section deliberately
 * hugs the top of the viewport and leaves the middle empty. When the canvas cannot carry
 * the labels (no WebGL, or a low-end device) the list drops back into the DOM.
 */
const Skills = () => {
    const { needsDomSkills } = useScene();

    return (
        <section
            id="skills"
            className="relative min-h-screen flex flex-col items-center justify-start px-5 sm:px-8 pt-32 pb-28 text-center"
        >
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="copy-scrim max-w-2xl"
            >
                <span className="section-eyebrow mb-6">03 — Arsenal</span>

                <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4 text-ink dark:text-moon-ink inline-flex items-center gap-3">
                    <Cpu className="text-tangerine dark:text-moon-glow" size={28} />
                    Technical Arsenal
                </h2>

                <p className="text-ink-soft dark:text-moon-ink-soft leading-relaxed">
                    {profile.skills.length} technologies, wired into one lattice — the tools I reach
                    for to build scalable, enterprise-grade systems.
                </p>
            </motion.div>

            {needsDomSkills ? (
                <motion.ul
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-10%" }}
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                    className="mt-12 flex flex-wrap justify-center gap-3 max-w-3xl"
                >
                    {profile.skills.map((skill) => (
                        <motion.li
                            key={skill}
                            variants={{
                                hidden: { opacity: 0, scale: 0.85 },
                                show: { opacity: 1, scale: 1 },
                            }}
                            className="glass-card rounded-full px-5 py-2.5 text-sm font-medium text-ink dark:text-moon-ink"
                        >
                            {skill}
                        </motion.li>
                    ))}
                </motion.ul>
            ) : (
                <ul className="sr-only">
                    {profile.skills.map((skill) => (
                        <li key={skill}>{skill}</li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default Skills;
