import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [clicked, setClicked] = useState(false);
    const [linkHovered, setLinkHovered] = useState(false);

    useEffect(() => {
        const addEventListeners = () => {
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mousedown", onMouseDown);
            document.addEventListener("mouseup", onMouseUp);
        };

        const onMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            const target = e.target;
            setLinkHovered(
                target.tagName === "A" ||
                target.tagName === "BUTTON" ||
                target.closest("a") ||
                target.closest("button")
            );
        };

        const onMouseDown = () => {
            setClicked(true);
        };

        const onMouseUp = () => {
            setClicked(false);
        };

        addEventListeners();
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mouseup", onMouseUp);
        };
    }, []);

    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            {/* Main Crosshair */}
            <motion.div
                className="absolute w-8 h-8 border border-white/50 rounded-full flex items-center justify-center translate-x-[-50%] translate-y-[-50%]"
                animate={{
                    x: position.x,
                    y: position.y,
                    scale: clicked ? 0.8 : linkHovered ? 1.5 : 1,
                    borderColor: linkHovered ? "rgba(59, 130, 246, 0.8)" : "rgba(255, 255, 255, 0.5)"
                }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
                <div className={`w-1 h-1 bg-white rounded-full ${linkHovered ? "bg-blue-400" : ""}`}></div>
            </motion.div>

            {/* Trailing Dashed Lines (HUD effect) */}
            <motion.div
                className="absolute w-screen h-[1px] bg-blue-500/20 top-0 left-0"
                animate={{ y: position.y }}
                transition={{ type: "spring", stiffness: 1000, damping: 50 }}
            />
            <motion.div
                className="absolute w-[1px] h-screen bg-blue-500/20 top-0 left-0"
                animate={{ x: position.x }}
                transition={{ type: "spring", stiffness: 1000, damping: 50 }}
            />
        </div>
    );
};

export default CustomCursor;
