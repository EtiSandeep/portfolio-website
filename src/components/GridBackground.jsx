import React, { useMemo } from "react";
import { useTheme } from "../context/ThemeContext";

const STAR_COUNT = 40;

// Soft, drifting blobs behind the page content — sunset tones by day, moonlight tones by night.
const GridBackground = () => {
    const { theme } = useTheme();

    const stars = useMemo(
        () =>
            Array.from({ length: STAR_COUNT }, (_, i) => ({
                id: i,
                top: Math.random() * 100,
                left: Math.random() * 100,
                size: Math.random() * 2 + 1,
                delay: Math.random() * 3,
                duration: 2.5 + Math.random() * 2.5,
            })),
        []
    );

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -left-32 w-[32rem] h-[32rem] rounded-full bg-coral/30 dark:bg-moon-indigo/40 blur-[110px] animate-blob-drift" />
            <div className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full bg-tangerine/30 dark:bg-moon-violet/30 blur-[120px] animate-blob-drift-slow" />
            <div className="absolute bottom-[-10rem] left-1/4 w-[30rem] h-[30rem] rounded-full bg-gold/30 dark:bg-moon-glow/20 blur-[110px] animate-blob-drift" />
            <div className="absolute bottom-1/4 right-1/3 w-72 h-72 rounded-full bg-rose/20 dark:bg-moon-plum/30 blur-[100px] animate-blob-drift-slow" />

            {/* Stars, night only */}
            {theme === "moon" &&
                stars.map((star) => (
                    <div
                        key={star.id}
                        className="absolute rounded-full bg-moon-glow animate-twinkle"
                        style={{
                            top: `${star.top}%`,
                            left: `${star.left}%`,
                            width: star.size,
                            height: star.size,
                            animationDelay: `${star.delay}s`,
                            animationDuration: `${star.duration}s`,
                        }}
                    />
                ))}

            {/* Paper grain for texture — multiply reads on cream, soft-light reads on night */}
            <div className="absolute inset-0 grain-overlay opacity-[0.4] mix-blend-multiply dark:opacity-60 dark:mix-blend-soft-light" />
        </div>
    );
};

export default GridBackground;
