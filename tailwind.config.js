import { INK_THEMES } from "./src/sketch/inkColors.js";

// Tokens come straight from the palette the shaders read, so the copy and the drawing
// behind it can never disagree about what colour the paper is.
const { paper, slate } = INK_THEMES;

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Ink on cartridge paper.
                paper: paper.ground,
                "paper-shade": paper.groundShade,
                ink: paper.stroke,
                "ink-soft": paper.strokeSoft,
                accent: paper.accent,
                "accent-warm": paper.accentWarm,

                // Chalk on slate.
                board: slate.ground,
                "board-shade": slate.groundShade,
                chalk: slate.stroke,
                "chalk-soft": slate.strokeSoft,
                "chalk-accent": slate.accent,
                "chalk-warm": slate.accentWarm,
            },
            fontFamily: {
                // Kalam for anything that should look written; a plain humanist sans for
                // anything that has to be read at length.
                hand: ['"Kalam"', '"Segoe Print"', '"Bradley Hand"', '"Comic Sans MS"', 'ui-rounded', 'system-ui', 'sans-serif'],
                sans: ['"Nunito Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
                display: ['"Kalam"', '"Segoe Print"', '"Bradley Hand"', '"Comic Sans MS"', 'ui-rounded', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                // Corners a hand would round: never the same twice around the shape.
                scrawl: '255px 14px 235px 16px / 16px 230px 14px 255px',
                'scrawl-alt': '18px 240px 16px 250px / 235px 16px 245px 14px',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 7s ease-in-out 1.5s infinite',
                'jitter': 'jitter 0.42s steps(2, end) infinite',
            },
            keyframes: {
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-14px)' },
                },
                // The shimmer of a line redrawn each frame.
                'jitter': {
                    '0%': { transform: 'translate(0, 0) rotate(0deg)' },
                    '50%': { transform: 'translate(0.4px, -0.3px) rotate(0.12deg)' },
                    '100%': { transform: 'translate(-0.3px, 0.35px) rotate(-0.1deg)' },
                },
            },
        },
    },
    plugins: [],
}
