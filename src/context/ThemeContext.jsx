import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "theme-preference";
const RECHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const DAY_START_HOUR = 6;
const DAY_END_HOUR = 18;

const getTimeBasedTheme = () => {
    const hour = new Date().getHours();
    return hour >= DAY_START_HOUR && hour < DAY_END_HOUR ? "sun" : "moon";
};

const getInitialState = () => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "sun" || stored === "moon") {
        return { theme: stored, isManual: true };
    }
    return { theme: getTimeBasedTheme(), isManual: false };
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [{ theme, isManual }, setState] = useState(getInitialState);

    useLayoutEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "moon");
    }, [theme]);

    // Keep following the sun/moon clock unless the visitor has manually chosen a theme.
    useEffect(() => {
        if (isManual) return;

        const recheck = () => {
            setState((prev) => (prev.isManual ? prev : { ...prev, theme: getTimeBasedTheme() }));
        };

        const interval = setInterval(recheck, RECHECK_INTERVAL);
        document.addEventListener("visibilitychange", recheck);
        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", recheck);
        };
    }, [isManual]);

    const toggleTheme = useCallback(() => {
        setState((prev) => {
            const next = prev.theme === "sun" ? "moon" : "sun";
            localStorage.setItem(STORAGE_KEY, next);
            return { theme: next, isManual: true };
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
    return ctx;
};
