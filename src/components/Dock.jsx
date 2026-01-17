import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Home, User, Briefcase, Code, Cpu, Mail } from "lucide-react";

const Dock = () => {
    const mouseX = useMotionValue(Infinity);

    const links = [
        { name: "Home", icon: <Home size={20} />, href: "#home" },
        { name: "About", icon: <User size={20} />, href: "#about" },
        { name: "Experience", icon: <Briefcase size={20} />, href: "#experience" },
        { name: "Skills", icon: <Cpu size={20} />, href: "#skills" },
        { name: "Work", icon: <Code size={20} />, href: "#projects" },
        { name: "Contact", icon: <Mail size={20} />, href: "#contact" },
    ];

    return (
        <motion.div
            layout
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl h-auto"
        >
            {links.map((link, index) => (
                <DockItem key={index} mouseX={mouseX} link={link} />
            ))}
        </motion.div>
    );
};

const DockItem = ({ mouseX, link }) => {
    const ref = useRef(null);
    const [hovered, setHovered] = useState(false);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <div className="relative flex flex-col items-center justify-end">
            <motion.div
                ref={ref}
                style={{ width, height: width }}
                className="aspect-square rounded-full bg-gray-900/80 border border-gray-800 flex items-center justify-center relative shadow-lg hover:border-blue-500/50 transition-colors z-10 overflow-hidden"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => window.location.hash = link.href.substring(1)}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                <div className="text-gray-400 group-hover:text-white w-full h-full flex items-center justify-center">
                    {/* Scale icon slightly based on container width if needed, or keep fixed */}
                    {React.cloneElement(link.icon, { size: "60%" })}
                </div>
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: -15, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        className="absolute bottom-full mb-2 bg-gray-900 border border-gray-700 px-2 py-1 rounded text-xs text-white whitespace-nowrap pointer-events-none z-50"
                    >
                        {link.name}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

import { useState } from "react";

export default Dock;
