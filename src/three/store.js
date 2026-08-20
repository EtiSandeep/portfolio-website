// Render-free input stores. The 3D world reads these every frame, so updating them
// must never trigger a React render — that is the whole point of keeping them here.

import { SECTION_IDS } from "./stations";

export const scroll = {
    /** Continuous position along the station list, e.g. 2.4 = 40% between station 2 and 3. */
    station: 0,
    /** 0..1 across the whole document. */
    progress: 0,
    /** Smoothed scroll speed in stations/second, used to stretch the world while travelling. */
    velocity: 0,
};

export const pointer = {
    /** -1..1, raw. */
    x: 0,
    y: 0,
    /** Whether a real pointing device has moved yet (touch devices stay centred). */
    active: false,
};

/**
 * How far along the drawing-to-built transition a station is, given where the camera is.
 * Work starts a little before arrival so a set piece is mid-construction as it comes into
 * view, and is complete by the time the visitor is looking straight at it.
 */
export function stationBuild(index, lead = 1.15) {
    const distance = scroll.station - (index - lead);
    const t = Math.min(Math.max(distance / lead, 0), 1);
    return t * t * (3 - 2 * t);
}

/** Linework inks in ahead of the solid, so the drawing always leads the build. */
export function stationDraw(index, lead = 1.9) {
    const distance = scroll.station - (index - lead);
    return Math.min(Math.max(distance / (lead * 0.55), 0), 1);
}

let centers = [];
let lastStation = 0;
let lastTime = 0;

const measure = () => {
    centers = SECTION_IDS.map((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return rect.top + window.scrollY + rect.height / 2;
    }).filter((v) => v !== null);
};

const readScroll = () => {
    if (centers.length < 2) return;

    const viewCenter = window.scrollY + window.innerHeight / 2;

    let station = 0;
    if (viewCenter <= centers[0]) {
        station = 0;
    } else if (viewCenter >= centers[centers.length - 1]) {
        station = centers.length - 1;
    } else {
        for (let i = 0; i < centers.length - 1; i++) {
            if (viewCenter >= centers[i] && viewCenter < centers[i + 1]) {
                const span = centers[i + 1] - centers[i] || 1;
                station = i + (viewCenter - centers[i]) / span;
                break;
            }
        }
    }

    const now = performance.now();
    const dt = Math.max((now - lastTime) / 1000, 0.001);
    lastTime = now;

    scroll.velocity = (station - lastStation) / dt;
    lastStation = station;
    scroll.station = station;

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    scroll.progress = scrollable > 0 ? window.scrollY / scrollable : 0;
};

const readPointer = (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    pointer.active = true;
};

/** Attaches the listeners. Returns a cleanup function. */
export function initInput() {
    lastTime = performance.now();
    measure();
    readScroll();

    const onResize = () => {
        measure();
        readScroll();
    };

    // Sections grow and shrink as fonts load and reveal animations run, so keep re-measuring.
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    if (ro) ro.observe(document.body);

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", readPointer, { passive: true });

    return () => {
        if (ro) ro.disconnect();
        window.removeEventListener("scroll", readScroll);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", readPointer);
    };
}
