import { useEffect, useRef } from "react";

/**
 * Everything that belongs to the print rather than the picture: the scope bars, the grain,
 * the weave of a gate that was never quite steady, and the burn-in furniture.
 *
 * The furniture lives inside the bars on purpose. It is where a lab would have put it, and
 * it means the small type is always on true black instead of competing with whatever the
 * shafts are doing behind it.
 */

/** Cut on twelves. Film does not move at sixty, and neither should anything imitating it. */
const FPS = 12;

const pad = (n, w = 2) => String(n).padStart(w, "0");

export default function Frame({ reel = "01", slate = "MAIN TITLE", children }) {
    const timecode = useRef(null);

    useEffect(() => {
        let raf = 0;
        let last = 0;
        const started = performance.now();

        const tick = (now) => {
            raf = requestAnimationFrame(tick);
            if (now - last < 1000 / FPS) return;
            last = now;

            if (!timecode.current) return;
            const elapsed = (now - started) / 1000;
            const frames = Math.floor(elapsed * FPS) % FPS;
            const seconds = Math.floor(elapsed) % 60;
            const minutes = Math.floor(elapsed / 60) % 60;
            timecode.current.textContent = `01:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div className="frame">
            <div className="frame-weave">{children}</div>

            <div className="frame-grain" aria-hidden="true" />
            <div className="frame-vignette" aria-hidden="true" />

            <div className="bar bar--top" aria-hidden="true">
                <span className="burn burn--left">
                    <i className="dot" /> REEL {reel}
                </span>
                <span className="burn burn--right">SCOPE 2.39:1</span>
            </div>

            <div className="bar bar--bottom" aria-hidden="true">
                <span className="burn burn--left" ref={timecode}>01:00:00:00</span>
                <span className="burn burn--right">{slate}</span>
            </div>
        </div>
    );
}
