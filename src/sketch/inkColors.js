/**
 * The one place the sketch palette is defined.
 *
 * Two ways of drawing, not two skins of the same thing: ink on cartridge paper by day,
 * chalk on a slate board by night. Every shader uniform, every Tailwind token and every CSS
 * custom property downstream is generated from this file, so the canvas and the copy can
 * never drift apart.
 *
 * Kept free of imports on purpose — tailwind.config.js reads it at build time, where three.js
 * must not be pulled in.
 */

export const INK_THEMES = {
    /** Ink on warm cartridge paper. */
    paper: {
        ground: "#F4EDDC",      // the sheet
        groundShade: "#D8C9AC", // fibre, vignette, the press of the edges
        stroke: "#1F1D1A",      // the pen
        strokeSoft: "#4A443C",  // a lighter hand, for secondary copy
        accent: "#1B4F91",      // ink blue
        accentWarm: "#A33822",  // red pen, for the things worth ringing
        /** How hard the light falls on the solids — chalk needs a flatter key. */
        keyLight: 0.82,
    },
    /** Chalk on slate. */
    slate: {
        ground: "#1B2320",
        groundShade: "#101614",
        stroke: "#EDE7D8",
        strokeSoft: "#B9B3A4",
        accent: "#8FC8E8",
        accentWarm: "#E5B96E",
        keyLight: 0.68,
    },
};

/** The site's existing theme names map onto the two drawing surfaces. */
export const SURFACE_FOR = { sun: "paper", moon: "slate" };
