import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const IDLE_DELAY = 1400;

/**
 * A drafting crosshair with a live coordinate readout — the pointer as a CAD tool rather
 * than a decorative dot. Hidden entirely on touch and for reduced-motion visitors, who get
 * their own cursor back.
 */
const CustomCursor = () => {
    const { theme } = useTheme();
    // Decided once at mount: a crosshair only makes sense for a fine pointer, and anyone
    // asking for reduced motion should keep their own cursor.
    const [enabled] = useState(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia("(pointer: fine)").matches &&
            !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [active, setActive] = useState(false);
    const [idle, setIdle] = useState(false);
    const idleTimer = useRef(null);

    useEffect(() => {
        if (!enabled) return undefined;

        document.documentElement.classList.add("cursor-hidden");

        const onMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
            const target = e.target;
            setActive(
                target.tagName === "A" ||
                target.tagName === "BUTTON" ||
                target.tagName === "CANVAS" ||
                !!target.closest("a") ||
                !!target.closest("button"),
            );
            setIdle(false);
            clearTimeout(idleTimer.current);
            idleTimer.current = setTimeout(() => setIdle(true), IDLE_DELAY);
        };

        document.addEventListener("mousemove", onMove);
        return () => {
            document.removeEventListener("mousemove", onMove);
            document.documentElement.classList.remove("cursor-hidden");
            clearTimeout(idleTimer.current);
        };
    }, [enabled]);

    if (!enabled) return null;

    const stroke = theme === "moon" ? "#6FC7F5" : "#1B4E8F";
    const size = active ? 30 : 22;

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-[120] will-change-transform"
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                opacity: idle ? 0.35 : 1,
                transition: "opacity 400ms ease",
            }}
        >
            <svg
                width={size * 2}
                height={size * 2}
                viewBox={`0 0 ${size * 2} ${size * 2}`}
                style={{ transform: `translate(${-size}px, ${-size}px)` }}
            >
                <line x1={size} y1="0" x2={size} y2={size - 5} stroke={stroke} strokeWidth="1" />
                <line x1={size} y1={size + 5} x2={size} y2={size * 2} stroke={stroke} strokeWidth="1" />
                <line x1="0" y1={size} x2={size - 5} y2={size} stroke={stroke} strokeWidth="1" />
                <line x1={size + 5} y1={size} x2={size * 2} y2={size} stroke={stroke} strokeWidth="1" />
                <circle
                    cx={size}
                    cy={size}
                    r={active ? 7 : 4}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="1"
                />
            </svg>

            <span
                className="absolute left-6 top-5 font-mono text-[10px] tracking-wider"
                style={{ color: stroke, opacity: 0.75 }}
            >
                {String(Math.round(position.x)).padStart(4, "0")},
                {String(Math.round(position.y)).padStart(4, "0")}
            </span>
        </div>
    );
};

export default CustomCursor;
