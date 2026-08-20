/**
 * The hero structure can be struck from two places — a click on the 3D object itself, and a
 * real button in the DOM for anyone not using a mouse. Both land here; the scene picks the
 * flag up on its next frame so nothing has to reach into React state.
 */
export const hero = { pending: false, strikes: 0 };

export const strikeHero = () => {
    hero.pending = true;
    hero.strikes += 1;
};
