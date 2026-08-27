import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Send } from "lucide-react";
import { profile } from "../data/profile";

const links = [
    { icon: Mail, label: "email", value: profile.contact.email, href: `mailto:${profile.contact.email}` },
    { icon: Linkedin, label: "linkedin", value: "Connect with me", href: profile.contact.linkedin },
    { icon: Github, label: "github", value: "View my code", href: profile.contact.github },
];

const FIELD =
    "w-full rounded-scrawl px-4 py-3 text-sm bg-transparent border-2 border-ink/55 dark:border-chalk/45 " +
    "text-ink dark:text-chalk placeholder-ink-soft/80 dark:placeholder-chalk-soft/70 " +
    "focus:outline-none focus:border-accent dark:focus:border-chalk-accent transition-colors";

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
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="sheet taped w-full max-w-3xl mx-auto p-8 sm:p-11"
            >
                <div className="text-center mb-9">
                    <span className="margin-note mb-5">05 — say something</span>
                    <h2 className="font-hand text-3xl sm:text-4xl font-bold text-ink dark:text-chalk mb-3">
                        Fold it up and <span className="underscored">throw it</span>.
                    </h2>
                    <p className="text-ink-soft dark:text-chalk-soft max-w-lg mx-auto">
                        Always open to new projects, creative ideas, or a conversation about
                        architecture over coffee.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3.5">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const { label, value, href } = link;
                            return (
                                <a
                                    key={label}
                                    href={href}
                                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                                    rel="noopener noreferrer"
                                    className="card flex items-center gap-3.5 p-3.5"
                                >
                                    <Icon size={19} className="shrink-0 text-accent dark:text-chalk-accent" />
                                    <span className="min-w-0">
                                        <span className="block font-hand text-sm text-ink-soft dark:text-chalk-soft">
                                            {label}
                                        </span>
                                        <span className="block text-sm font-semibold text-ink dark:text-chalk truncate">
                                            {value}
                                        </span>
                                    </span>
                                </a>
                            );
                        })}
                    </div>

                    <form className="space-y-3.5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="contact-name" className="sr-only">Name</label>
                            <input
                                id="contact-name"
                                required
                                value={form.name}
                                onChange={update("name")}
                                placeholder="Your name"
                                className={FIELD}
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
                                className={FIELD}
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
                                className={`${FIELD} resize-none`}
                            />
                        </div>
                        <button type="submit" className="ink-btn ink-btn--filled w-full">
                            Send message <Send size={16} />
                        </button>
                    </form>
                </div>
            </motion.div>
        </section>
    );
};

export default Contact;
