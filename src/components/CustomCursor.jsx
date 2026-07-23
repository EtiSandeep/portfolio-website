import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const IDLE_DELAY = 1200;

const CustomCursor = () => {
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
            {/* Soft glow trail */}
            <motion.div
                className="absolute rounded-full blur-md mix-blend-multiply"
                style={{
                    background: "radial-gradient(circle, #FF6B6B 0%, #F7A94E 60%, transparent 80%)",
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    x: position.x,
                    y: position.y,
                    width: linkHovered ? 56 : clicked ? 24 : 32,
                    height: linkHovered ? 56 : clicked ? 24 : 32,
                    opacity: idle ? 0 : linkHovered ? 0.55 : 0.35,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />

            {/* Precise center dot */}
            <motion.div
                className="absolute w-2 h-2 rounded-full bg-ink"
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
