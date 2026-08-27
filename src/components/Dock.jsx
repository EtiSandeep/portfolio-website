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

/** A strip of paper taped along the bottom of the sheet, with the sections listed on it. */
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
        <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-1.5rem)]">
            <div className="sheet flex items-center gap-1 sm:gap-2.5 px-2.5 sm:px-4 py-2 sm:py-2.5">
                {links.map((link) => (
                    <DockItem key={link.href} link={link} isActive={active === link.href} />
                ))}

                <div className="w-px h-6 bg-ink/25 dark:bg-chalk/25" />

                <ThemeToggle />
            </div>
        </div>
    );
};

/** Icons sit in circles someone drew round them; the one you are on gets gone over twice. */
const DockItem = ({ link, isActive }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div className="relative flex flex-col items-center justify-end">
            <motion.a
                href={link.href}
                aria-label={link.name}
                aria-current={isActive ? "true" : undefined}
                whileHover={{ scale: 1.12, y: -4 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center relative z-10 border-2 transition-colors ${
                    isActive
                        ? "border-ink dark:border-chalk text-ink dark:text-chalk"
                        : "border-transparent text-ink-soft dark:text-chalk-soft hover:border-ink/45 dark:hover:border-chalk/40"
                }`}
                style={{ borderRadius: "52% 48% 45% 55% / 55% 52% 48% 45%" }}
            >
                {React.cloneElement(link.icon, { size: "55%" })}
            </motion.a>

            {isActive && (
                <motion.span
                    layoutId="dock-active-mark"
                    aria-hidden="true"
                    className="absolute -bottom-1.5 w-4 h-[2px] bg-accent dark:bg-chalk-accent"
                />
            )}

            <AnimatePresence>
                {hovered && (
                    <motion.span
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: -14 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute bottom-full mb-2 font-hand text-sm bg-ink text-paper dark:bg-chalk dark:text-board px-2 py-0.5 whitespace-nowrap pointer-events-none z-50"
                        style={{ borderRadius: "255px 12px 225px 14px / 14px 220px 12px 255px" }}
                    >
                        {link.name}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
};

/** Not day and night so much as which surface you are drawing on. */
const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    const [hovered, setHovered] = useState(false);
    const isSun = theme === "sun";

    return (
        <div className="relative flex flex-col items-center justify-end">
            <motion.button
                whileHover={{ scale: 1.12, y: -4 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={toggleTheme}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                aria-label={isSun ? "Switch to chalk on slate" : "Switch to ink on paper"}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border-2 border-ink dark:border-chalk text-ink dark:text-chalk"
                style={{ borderRadius: "48% 52% 55% 45% / 45% 55% 48% 52%" }}
            >
                {isSun ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            <AnimatePresence>
                {hovered && (
                    <motion.span
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: -14 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute bottom-full mb-2 font-hand text-sm bg-ink text-paper dark:bg-chalk dark:text-board px-2 py-0.5 whitespace-nowrap pointer-events-none z-50"
                        style={{ borderRadius: "255px 12px 225px 14px / 14px 220px 12px 255px" }}
                    >
                        {isSun ? "chalk on slate" : "ink on paper"}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dock;
