import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const IDLE_DELAY = 1200;

// The wet blot under the nib: ink soaking into paper, chalk dust settling on slate.
const BLOT = {
    sun: "radial-gradient(circle, #1B4F91 0%, #1F1D1A 62%, transparent 80%)",
    moon: "radial-gradient(circle, #EDE7D8 0%, #8FC8E8 62%, transparent 80%)",
};

const CustomCursor = () => {
    const { theme } = useTheme();
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [clicked, setClicked] = useState(false);
    const [linkHovered, setLinkHovered] = useState(false);
    const [idle, setIdle] = useState(false);
    const idleTimer = useRef(null);

    useEffect(() => {
        const onMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            const target = e.target;
            setLinkHovered(
                target.tagName === "A" ||
                target.tagName === "BUTTON" ||
                !!target.closest("a") ||
                !!target.closest("button")
            );

            setIdle(false);
            clearTimeout(idleTimer.current);
            idleTimer.current = setTimeout(() => setIdle(true), IDLE_DELAY);
        };

        const onMouseDown = () => setClicked(true);
        const onMouseUp = () => setClicked(false);

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mouseup", onMouseUp);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mousedown", onMouseDown);
            document.removeEventListener("mouseup", onMouseUp);
            clearTimeout(idleTimer.current);
        };
    }, []);

    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
            {/* Multiply reads as ink sinking into the stock; screen reads as chalk dust. */}
            <motion.div
                className="absolute rounded-full blur-md"
                style={{
                    background: BLOT[theme],
                    mixBlendMode: theme === "moon" ? "screen" : "multiply",
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    x: position.x,
                    y: position.y,
                    width: linkHovered ? 56 : clicked ? 24 : 32,
                    height: linkHovered ? 56 : clicked ? 24 : 32,
                    opacity: idle ? 0 : linkHovered ? 0.45 : 0.28,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />

            {/* The nib itself. */}
            <motion.div
                className="absolute w-2 h-2 rounded-full bg-ink dark:bg-chalk"
                style={{ translateX: "-50%", translateY: "-50%" }}
                animate={{
                    x: position.x,
                    y: position.y,
                    scale: clicked ? 0.6 : 1,
                }}
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
            />
        </div>
    );
};

export default CustomCursor;
