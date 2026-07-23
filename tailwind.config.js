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
                cream: "#FFF8F0",
                paper: "#FFF1E1",
                ink: "#2B1B12",
                "ink-soft": "#7A6255",
                coral: "#FF6B6B",
                tangerine: "#F7A94E",
                gold: "#FFD97D",
                rose: "#FF8FA3",
                plum: "#6B3A4E",
                // Moonlight (night theme) palette
                night: "#140C24",
                "night-paper": "#1F1638",
                "moon-ink": "#F3ECFB",
                "moon-ink-soft": "#B7A8D1",
                "moon-indigo": "#4B3B8C",
                "moon-violet": "#8B7FD9",
                "moon-glow": "#F0D9A0",
                "moon-plum": "#6B4E85",
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
