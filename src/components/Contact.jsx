import React from "react";
import { motion } from "framer-motion";
import { profile } from "../data/profile";
import { Mail, Linkedin, Github, Send } from "lucide-react";

const Contact = () => {
    return (
        <section id="contact" className="py-24 bg-dark relative">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="p-8 md:p-12 bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden relative"
                >
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>


                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">Let's Work Together</h2>
                        <p className="text-gray-400">
                            Interested in building something extraordinary? I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <a href={`mailto:${profile.contact.email}`} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:text-white group-hover:bg-blue-500 transition-all">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm text-gray-400">Email Me</h4>
                                    <p className="text-white font-medium">{profile.contact.email}</p>
                                </div>
                            </a>

                            <a href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:text-white group-hover:bg-blue-500 transition-all">
                                    <Linkedin size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm text-gray-400">LinkedIn</h4>
                                    <p className="text-white font-medium">Connect on LinkedIn</p>
                                </div>
                            </a>

                            <a href={profile.contact.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:text-white group-hover:bg-blue-500 transition-all">
                                    <Github size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm text-gray-400">GitHub</h4>
                                    <p className="text-white font-medium">View Code</p>
                                </div>
                            </a>
                        </div>

                        {/* Simple Form */}
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Name</label>
                                <input type="text" className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Email</label>
                                <input type="email" className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Message</label>
                                <textarea rows={4} className="w-full bg-dark/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none" placeholder="Tell me about your project..."></textarea>
                            </div>
                            <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                Send Message <Send size={18} />
                            </button>
                        </form>
                    </div>
                </motion.div>

                <div className="mt-20 text-center border-t border-gray-800 pt-8">
                    <p className="text-gray-500 text-sm">
                        Built by <span className="text-blue-400">Antigravity</span> for {profile.name}.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Contact;
