import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Send } from "lucide-react";
import { profile } from "../data/profile";

const links = [
    { icon: Mail, label: "Email", value: profile.contact.email, href: `mailto:${profile.contact.email}` },
    { icon: Linkedin, label: "LinkedIn", value: "Connect with me", href: profile.contact.linkedin },
    { icon: Github, label: "GitHub", value: "View my code", href: profile.contact.github },
];

const Contact = () => {
    const [form, setForm] = useState({ name: "", email: "", message: "" });

    const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    // No backend here, so the form hands off to the visitor's own mail client.
    const handleSubmit = (e) => {
        e.preventDefault();
        const subject = encodeURIComponent(`Portfolio enquiry from ${form.name || "someone"}`);
        const body = encodeURIComponent(`${form.message}\n\n— ${form.name}\n${form.email}`);
        window.location.href = `mailto:${profile.contact.email}?subject=${subject}&body=${body}`;
    };

    return (
        <section id="contact" className="relative min-h-screen flex items-center px-5 sm:px-8 pt-24 pb-40 sm:pb-28">
            <motion.div
                initial={{ opacity: 0, y: 36, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="glass-panel w-full max-w-3xl mx-auto p-8 sm:p-11"
            >
                <div className="text-center mb-9">
                    <span className="section-eyebrow mb-5">05 — Contact</span>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink dark:text-moon-ink mb-3">
                        Let&apos;s build something <span className="gradient-text">extraordinary</span>.
                    </h2>
                    <p className="text-ink-soft dark:text-moon-ink-soft max-w-lg mx-auto">
                        Always open to new projects, creative ideas, or a conversation about
                        architecture over coffee.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const { label, value, href } = link;
                            return (
                            <a
                                key={label}
                                href={href}
                                target={href.startsWith("mailto:") ? undefined : "_blank"}
                                rel="noopener noreferrer"
                                className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 transition-colors group"
                            >
                                <span className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-coral to-tangerine dark:from-moon-indigo dark:to-moon-violet text-white flex items-center justify-center shadow-md shadow-coral/30 dark:shadow-moon-indigo/40 group-hover:scale-105 transition-transform">
                                    <Icon size={17} />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[11px] uppercase tracking-[0.15em] text-ink-soft dark:text-moon-ink-soft">
                                        {label}
                                    </span>
                                    <span className="block text-sm font-medium text-ink dark:text-moon-ink truncate">
                                        {value}
                                    </span>
                                </span>
                            </a>
                            );
                        })}
                    </div>

                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="contact-name" className="sr-only">Name</label>
                            <input
                                id="contact-name"
                                required
                                value={form.name}
                                onChange={update("name")}
                                placeholder="Your name"
                                className="w-full rounded-xl px-4 py-3 text-sm bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-ink dark:text-moon-ink placeholder-ink-soft/70 dark:placeholder-moon-ink-soft/60 focus:outline-none focus:border-coral dark:focus:border-moon-violet transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="contact-email" className="sr-only">Email</label>
                            <input
                                id="contact-email"
                                type="email"
                                required
                                value={form.email}
                                onChange={update("email")}
                                placeholder="you@company.com"
                                className="w-full rounded-xl px-4 py-3 text-sm bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-ink dark:text-moon-ink placeholder-ink-soft/70 dark:placeholder-moon-ink-soft/60 focus:outline-none focus:border-coral dark:focus:border-moon-violet transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="contact-message" className="sr-only">Message</label>
                            <textarea
                                id="contact-message"
                                rows={4}
                                required
                                value={form.message}
                                onChange={update("message")}
                                placeholder="Tell me about your project…"
                                className="w-full rounded-xl px-4 py-3 text-sm resize-none bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 text-ink dark:text-moon-ink placeholder-ink-soft/70 dark:placeholder-moon-ink-soft/60 focus:outline-none focus:border-coral dark:focus:border-moon-violet transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-coral to-tangerine dark:from-moon-indigo dark:to-moon-violet hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-coral/30 dark:shadow-moon-indigo/40"
                        >
                            Send message <Send size={16} />
                        </button>
                    </form>
                </div>
            </motion.div>
        </section>
    );
};

export default Contact;
