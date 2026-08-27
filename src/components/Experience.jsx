import { motion } from "framer-motion";
import Section from "./Section";
import { profile } from "../data/profile";

const Experience = () => (
    <Section id="experience" align="left">
        <div className="sheet p-7 sm:p-9">
            <span className="margin-note mb-5">02 — the climb</span>

            <h2 className="font-hand text-3xl sm:text-4xl font-bold mb-7 text-ink dark:text-chalk">
                Seven years, <span className="underscored">six rungs</span>.
            </h2>

            <ol className="relative pl-7">
                {/* The rail mirrors the drawn spine threading the plates beside this sheet. */}
                <span
                    aria-hidden="true"
                    className="absolute left-[5px] top-2 bottom-2 w-px bg-ink/35 dark:bg-chalk/30"
                />

                {profile.experience.map((exp, i) => (
                    <motion.li
                        key={`${exp.role}-${exp.period}`}
                        initial={{ opacity: 0, x: -18 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.5, delay: i * 0.06 }}
                        className="relative pb-6 last:pb-0"
                    >
                        {/* A circle drawn round the point, not a filled dot. */}
                        <span
                            aria-hidden="true"
                            className="absolute -left-[26px] top-[7px] w-[13px] h-[13px] rounded-full border-2 border-ink dark:border-chalk bg-paper dark:bg-board"
                            style={{ borderRadius: "52% 48% 45% 55% / 55% 52% 48% 45%" }}
                        />
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                            <h3 className="font-hand text-xl font-bold text-ink dark:text-chalk">
                                {exp.role}
                            </h3>
                            <span className="font-hand text-sm text-accent dark:text-chalk-accent">
                                {exp.period}
                            </span>
                        </div>
                        <p className="mt-1.5 text-[13.5px] text-ink-soft dark:text-chalk-soft leading-relaxed">
                            {exp.description}
                        </p>
                    </motion.li>
                ))}
            </ol>
        </div>
    </Section>
);

export default Experience;
