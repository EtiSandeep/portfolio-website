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
                // Drafting paper — the day sheet, under studio light.
                cream: "#EFEADC",
                paper: "#F7F3E9",
                ink: "#14243A",
                "ink-soft": "#46586F",

                // Decorative linework and brass. Bright enough to draw with, too bright to
                // set type in — see ember/rust/wine below for the text-safe versions.
                coral: "#2E6FBF",
                tangerine: "#C08A2E",
                gold: "#E3C77A",
                rose: "#7FB2E8",
                plum: "#243B57",

                // Text-safe: anything carrying type, or sitting under white type.
                ember: "#1B4E8F",
                rust: "#7A4E12",
                wine: "#243B57",

                // Cyanotype — the night sheet.
                night: "#08182E",
                "night-paper": "#0C2340",
                "moon-ink": "#DCEEFB",
                "moon-ink-soft": "#93B6D4",
                "moon-indigo": "#17558A",
                "moon-violet": "#6FC7F5",
                "moon-violet-deep": "#17558A",
                "moon-glow": "#E0B45E",
                "moon-plum": "#123A5E",
            },
            fontFamily: {
                display: ['"Outfit"', 'sans-serif'],
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 14s linear infinite',
                'blob-drift': 'blob-drift 18s ease-in-out infinite',
                'blob-drift-slow': 'blob-drift 26s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 7s ease-in-out 1.5s infinite',
                'twinkle': 'twinkle 3s ease-in-out infinite',
            },
            keyframes: {
                'blob-drift': {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(4%, 6%) scale(1.08)' },
                    '66%': { transform: 'translate(-3%, -4%) scale(0.95)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-16px)' },
                },
                'twinkle': {
                    '0%, 100%': { opacity: 0.2 },
                    '50%': { opacity: 1 },
                },
            },
        },
    },
    plugins: [],
}
