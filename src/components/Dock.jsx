import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Briefcase, Code, Cpu, Mail, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

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
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl p-[1.5px] bg-gradient-to-r from-coral via-tangerine to-gold dark:from-moon-indigo dark:via-moon-violet dark:to-moon-glow shadow-[0_10px_35px_rgba(255,107,107,0.35)] dark:shadow-[0_10px_35px_rgba(75,59,140,0.5)]">
            <div className="flex items-center gap-4 px-4 py-3 bg-white/90 dark:bg-night-paper/90 backdrop-blur-xl rounded-[15px]">
                {links.map((link, index) => (
                    <DockItem key={index} link={link} isActive={active === link.href} />
                ))}

                <div className="w-px h-6 bg-ink/10 dark:bg-white/10" />

                <ThemeToggle />
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
                        ? "bg-gradient-to-br from-coral to-tangerine dark:from-moon-indigo dark:to-moon-violet shadow-md shadow-coral/40 dark:shadow-moon-indigo/50"
                        : "bg-white dark:bg-night-paper shadow-sm ring-1 ring-black/5 dark:ring-white/10 hover:bg-gradient-to-br hover:from-coral hover:to-tangerine dark:hover:from-moon-indigo dark:hover:to-moon-violet hover:shadow-md hover:shadow-coral/30 dark:hover:shadow-moon-indigo/40"
                    }`}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => window.location.hash = link.href.substring(1)}
            >
                <div className={`w-full h-full flex items-center justify-center transition-colors ${isActive ? "text-white" : "text-ink-soft dark:text-moon-ink-soft hover:text-white"
                    }`}>
                    {React.cloneElement(link.icon, { size: "55%" })}
                </div>
            </motion.div>

            {/* Active indicator dot */}
            {isActive && (
                <motion.div
                    layoutId="dock-active-dot"
                    className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-coral to-tangerine dark:from-moon-indigo dark:to-moon-violet"
                />
            )}

            {/* Tooltip */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: -15, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        className="absolute bottom-full mb-2 bg-ink text-cream dark:bg-moon-ink dark:text-night px-2 py-1 rounded-lg text-xs whitespace-nowrap pointer-events-none z-50"
                    >
                        {link.name}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const [hovered, setHovered] = useState(false);
    const isSun = theme === "sun";

    return (
        <div className="relative flex flex-col items-center justify-end">
            <motion.button
                whileHover={{ scale: 1.15, y: -6 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={toggleTheme}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                aria-label={isSun ? "Switch to night theme" : "Switch to day theme"}
                className={`w-11 h-11 rounded-full flex items-center justify-center text-white transition-colors ${isSun
                        ? "bg-gradient-to-br from-tangerine to-gold shadow-md shadow-tangerine/40"
                        : "bg-gradient-to-br from-moon-indigo to-moon-violet shadow-md shadow-moon-indigo/50"
                    }`}
            >
                {isSun ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: -15, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        className="absolute bottom-full mb-2 bg-ink text-cream dark:bg-moon-ink dark:text-night px-2 py-1 rounded-lg text-xs whitespace-nowrap pointer-events-none z-50"
                    >
                        {isSun ? "Night mode" : "Day mode"}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dock;
