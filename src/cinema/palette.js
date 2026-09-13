import { Color } from "three";
import { FILM } from "./filmColors";

/**
 * Live colours for the shaders. There is only one grade in this site, so unlike the sketch
 * theme nothing crossfades — but the uniforms still come from one place, so a change to the
 * grade moves the frame and the type together.
 */
const KEYS = ["void", "shadow", "smoke", "beam", "amber", "ember", "title", "caption", "dim"];

export const film = Object.fromEntries(KEYS.map((k) => [k, new Color(FILM[k])]));

/** Starting uniforms for anything that lights itself from the grade. */
export const filmUniforms = () => ({
    uVoid: { value: film.void.clone() },
    uShadow: { value: film.shadow.clone() },
    uSmoke: { value: film.smoke.clone() },
    uBeam: { value: film.beam.clone() },
    uAmber: { value: film.amber.clone() },
});

export { FILM };
