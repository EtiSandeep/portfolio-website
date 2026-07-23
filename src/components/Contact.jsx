import React from "react";
import { motion } from "framer-motion";
import { profile } from "../data/profile";
import { Mail, Linkedin, Github, Send } from "lucide-react";

const Contact = () => {
    return (
        <section id="contact" className="py-24 relative">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="p-8 md:p-14 bg-gradient-to-br from-coral via-tangerine to-gold dark:from-moon-indigo dark:via-moon-violet dark:to-moon-plum rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-coral/30 dark:shadow-moon-indigo/40"
                >
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-white/20 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

                    <div className="text-center mb-12 relative">
                        <h2 className="font-display text-4xl font-bold mb-4 text-white">Let's Work Together</h2>
                        <p className="text-white/90 max-w-xl mx-auto">
                            Interested in building something extraordinary? I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center relative">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <a href={`mailto:${profile.contact.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center text-white group-hover:bg-white group-hover:text-coral dark:group-hover:text-moon-indigo transition-all">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm text-white/80">Email Me</h4>
                                    <p className="text-white font-medium">{profile.contact.email}</p>
                                </div>
                            </a>

                            <a href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center text-white group-hover:bg-white group-hover:text-coral dark:group-hover:text-moon-indigo transition-all">
                                    <Linkedin size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm text-white/80">LinkedIn</h4>
                                    <p className="text-white font-medium">Connect on LinkedIn</p>
                                </div>
                            </a>

                            <a href={profile.contact.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center text-white group-hover:bg-white group-hover:text-coral dark:group-hover:text-moon-indigo transition-all">
                                    <Github size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm text-white/80">GitHub</h4>
                                    <p className="text-white font-medium">View Code</p>
                                </div>
                            </a>
                        </div>

                        {/* Simple Form */}
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/90">Name</label>
                                <input type="text" className="w-full bg-white/20 border border-white/40 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/30 transition-colors" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/90">Email</label>
                                <input type="email" className="w-full bg-white/20 border border-white/40 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/30 transition-colors" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/90">Message</label>
                                <textarea rows={4} className="w-full bg-white/20 border border-white/40 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/30 transition-colors resize-none" placeholder="Tell me about your project..."></textarea>
                            </div>
                            <button className="w-full py-4 bg-white rounded-xl font-bold text-coral dark:text-moon-indigo hover:bg-cream transition-colors flex items-center justify-center gap-2">
                                Send Message <Send size={18} />
                            </button>
                        </form>
                    </div>
                </motion.div>

                <div className="mt-20 text-center border-t border-ink/10 dark:border-white/10 pt-8">
                    <p className="text-ink-soft dark:text-moon-ink-soft text-sm">
                        Designed &amp; built with care by {profile.name}.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Contact;
