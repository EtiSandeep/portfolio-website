import { createContext, useContext, useMemo } from "react";
import { useQuality } from "../hooks/useQuality";

const SceneContext = createContext(null);

const supportsWebGL = () => {
    if (typeof window === "undefined") return false;
    try {
        const canvas = document.createElement("canvas");
        return Boolean(
            window.WebGLRenderingContext &&
            (canvas.getContext("webgl2") || canvas.getContext("webgl")),
        );
    } catch {
        return false;
    }
};

/**
 * One place to ask "is the 3D world actually running, and how rich is it?" — the DOM
 * layer uses this to decide when it needs to carry content the canvas would have shown.
 */
export const SceneProvider = ({ children }) => {
    const quality = useQuality();
    const value = useMemo(() => {
        const webgl = supportsWebGL();
        return {
            quality,
            webgl,
            enabled: webgl,
            // True when the canvas is not showing skill labels, so the DOM must.
            needsDomSkills: !webgl || quality.tier === "low",
        };
    }, [quality]);

    return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
};

export const useScene = () => {
    const ctx = useContext(SceneContext);
    if (!ctx) throw new Error("useScene must be used within a SceneProvider");
    return ctx;
};
