import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Briefcase, Code, Cpu, Mail } from "lucide-react";

const links = [
    { name: "Home", icon: <Home size={20} />, href: "#home" },
    { name: "About", icon: <User size={20} />, href: "#about" },
    { name: "Experience", icon: <Briefcase size={20} />, href: "#experience" },
    { name: "Skills", icon: <Cpu size={20} />, href: "#skills" },
    { name: "Work", icon: <Code size={20} />, href: "#projects" },
    { name: "Contact", icon: <Mail size={20} />, href: "#contact" },
];

const Dock = () => {
    const [active, setActive] = useState("#home");

    useEffect(() => {
        const sections = links
            .map((link) => document.querySelector(link.href))
            .filter(Boolean);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActive(`#${entry.target.id}`);
                    }
                });
            },
            { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl p-[1.5px] bg-gradient-to-r from-coral via-tangerine to-gold shadow-[0_10px_35px_rgba(255,107,107,0.35)]">
            <div className="flex items-center gap-4 px-4 py-3 bg-white/90 backdrop-blur-xl rounded-[15px]">
                {links.map((link, index) => (
                    <DockItem key={index} link={link} isActive={active === link.href} />
                ))}
            </div>
        </div>
    );
};

const DockItem = ({ link, isActive }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div className="relative flex flex-col items-center justify-end">
            <motion.div
                whileHover={{ scale: 1.15, y: -6 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`w-11 h-11 rounded-full flex items-center justify-center relative z-10 cursor-pointer transition-colors ${isActive
                        ? "bg-gradient-to-br from-coral to-tangerine shadow-md shadow-coral/40"
                        : "bg-white shadow-sm ring-1 ring-black/5 hover:bg-gradient-to-br hover:from-coral hover:to-tangerine hover:shadow-md hover:shadow-coral/30"
                    }`}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => window.location.hash = link.href.substring(1)}
            >
                <div className={`w-full h-full flex items-center justify-center transition-colors ${isActive ? "text-white" : "text-ink-soft hover:text-white"
                    }`}>
                    {React.cloneElement(link.icon, { size: "55%" })}
                </div>
            </motion.div>

            {/* Active indicator dot */}
            {isActive && (
                <motion.div
                    layoutId="dock-active-dot"
                    className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-coral to-tangerine"
                />
            )}

            {/* Tooltip */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: -15, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        className="absolute bottom-full mb-2 bg-ink text-cream px-2 py-1 rounded-lg text-xs whitespace-nowrap pointer-events-none z-50"
                    >
                        {link.name}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dock;
