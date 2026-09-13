/**
 * The grade.
 *
 * One place the whole look is defined — shaders, Tailwind tokens and CSS variables are all
 * generated from here, so the frame and the type can never disagree about what black is.
 *
 * Cold shadows, warm light. That split is most of what makes an image read as photographed
 * rather than drawn: the fill is blue because it is bounced sky, the key is amber because it
 * is a tungsten practical, and everything sits between the two.
 */

export const FILM = {
    void: "#05070A",        // the deepest black in frame — the letterbox, the gate
    shadow: "#0A0F15",      // cold fill
    smoke: "#141B23",       // where the beam has not quite reached
    beam: "#F4EEE1",        // the light itself
    amber: "#E7B271",       // the warm practical
    ember: "#C8462E",       // the one saturated accent: reel marks, rules, the live dot
    emberText: "#E0674C",   // the same accent lifted far enough to carry small type
    title: "#F6F3ED",       // type in the light
    caption: "#A2AAB4",     // type out of it
    dim: "#8E96A1",         // furniture, timecode, things you are not meant to read first
};

/** 2.39:1 — anamorphic scope, the widest frame that still fits a phone sensibly. */
export const ASPECT = 2.39;
