import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Cpu } from "lucide-react";
import { profile } from "../data/profile";

const Hero = () => {
    const [text, setText] = useState("");
    const fullText = "INITIALIZING SYSTEM ARCHITECTURE...";

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setText(fullText.substring(0, i));
            i++;
            if (i > fullText.length) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">

            {/* Architectural Guidelines */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-10 left-10 border-l mb-2 border-t border-blue-500/30 w-16 h-16"></div>
                <div className="absolute text-[10px] text-blue-500/50 font-mono top-12 left-12">FIG 1.0</div>

                <div className="absolute bottom-10 right-10 border-r border-b border-blue-500/30 w-16 h-16"></div>
                <div className="absolute text-[10px] text-blue-500/50 font-mono bottom-12 right-12">SYS.READY</div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* Main Content - Left */}
                <div className="lg:col-span-8 text-left">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-mono text-blue-500 text-sm mb-4 tracking-widest flex items-center gap-2"
                    >
                        <Terminal size={14} />
                        {text}<span className="animate-pulse">_</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                        className="text-6xl md:text-8xl font-black tracking-tighter mb-6 relative"
                    >
                        <span className="text-blue-500">ETI</span>
                        <br />
                        <span className="text-white">SANDEEP</span>

                        <motion.span
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="absolute bottom-2 left-0 h-1 bg-blue-600"
                        ></motion.span>
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex items-start gap-4 mb-8"
                    >
                        <div className="w-1 bg-gradient-to-b from-blue-500 to-transparent h-24 hidden md:block"></div>
                        <div>
                            <h2 className="text-2xl md:text-3xl text-gray-300 font-light mb-2">
                                {profile.headline.split("|")[0]}
                            </h2>
                            <p className="text-gray-400 max-w-xl">
                                {profile.subHeadline}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="flex gap-6"
                    >
                        <a
                            href="#projects"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-mono text-sm tracking-wider flex items-center gap-2 transition-all clip-path-slant"
                            style={{ clipPath: "polygon(0 0, 100% 0, 95% 100%, 0% 100%)" }}
                        >
                            ACCESS FILES <ArrowRight size={16} />
                        </a>
                        <a
                            href="#contact"
                            className="px-8 py-4 border border-blue-500/30 hover:bg-blue-500/10 text-blue-400 font-mono text-sm tracking-wider transition-all"
                        >
                            INITIATE COMMS
                        </a>
                    </motion.div>
                </div>

                {/* HUD Elements - Right */}
                <div className="lg:col-span-4 hidden lg:block">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 }}
                        className="relative p-10 border border-blue-500/20 rounded-full w-80 h-80 flex items-center justify-center animate-spin-slow"
                    >
                        <div className="absolute inset-0 border-t border-blue-500/50 rounded-full"></div>
                        <div className="absolute inset-4 border-b border-purple-500/50 rounded-full reverse-spin"></div>
                        <Cpu size={64} className="text-blue-500/50" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
