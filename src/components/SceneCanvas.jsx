import { lazy, Suspense } from "react";
import { useTheme } from "../context/ThemeContext";
import { useScene } from "../context/SceneContext";

const SketchCanvas = lazy(() => import("../sketch/SketchCanvas"));

/**
 * Painted while the WebGL chunk loads, and kept permanently where WebGL is unavailable.
 * Plain stock with its grain — the sheet, before anything has been drawn on it.
 */
const Backdrop = () => (
    <div aria-hidden="true" className="fixed inset-0 z-0 bg-paper dark:bg-board">
        <div className="absolute inset-0 grain-overlay opacity-[0.16] dark:opacity-[0.22]" />
    </div>
);

/**
 * The drawing sits in one fixed canvas behind every section, so scrolling the page flies
 * the camera across a single sheet instead of cutting between separate scenes.
 */
export default function SceneCanvas() {
    const { theme } = useTheme();
    const { enabled, quality } = useScene();

    if (!enabled) return <Backdrop />;

    return (
        <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none">
            <Suspense fallback={<Backdrop />}>
                <SketchCanvas theme={theme} quality={quality} />
            </Suspense>
        </div>
    );
}
