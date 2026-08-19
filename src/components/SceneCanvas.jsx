import { lazy, Suspense } from "react";
import { useTheme } from "../context/ThemeContext";
import { useScene } from "../context/SceneContext";

const WorldCanvas = lazy(() => import("../three/WorldCanvas"));

/** Painted while the WebGL chunk loads, and kept permanently where WebGL is unavailable. */
const Backdrop = () => (
    <div
        aria-hidden="true"
        className="fixed inset-0 z-0 bg-gradient-to-br from-cream via-paper to-gold/30 dark:from-night dark:via-night-paper dark:to-moon-indigo/40"
    />
);

/**
 * The world sits in one fixed canvas behind every section, so scrolling the page flies the
 * camera through a single continuous space instead of cutting between separate scenes.
 */
export default function SceneCanvas() {
    const { theme } = useTheme();
    const { enabled, quality } = useScene();

    if (!enabled) return <Backdrop />;

    return (
        <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none">
            <Suspense fallback={<Backdrop />}>
                <WorldCanvas theme={theme} quality={quality} />
            </Suspense>
        </div>
    );
}
