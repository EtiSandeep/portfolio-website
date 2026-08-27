// The camera flies a fixed route through the world; each DOM section owns one stop on it.
// `anchor` is where that section's set piece lives, `camOffset` is where the camera parks
// relative to it, `pieceSide` says which half of the screen the set piece should occupy on
// wide viewports so the copy can take the other half, and `pieceLift` nudges it down the
// frame when the copy sits above it rather than beside it.

export const STATIONS = [
    { id: "home", anchor: [0, 0, 0], camOffset: [0, 0.4, 9.5], pieceSide: 1 },
    { id: "about", anchor: [6.5, -12, -10], camOffset: [0, 1.0, 9.0], pieceSide: -1 },
    { id: "experience", anchor: [-6.5, -25, -22], camOffset: [0, 1.2, 10.5], pieceSide: 1 },
    { id: "skills", anchor: [5.5, -38, -35], camOffset: [0, 0.5, 14.5], pieceSide: 0, pieceLift: 1.35 },
    { id: "projects", anchor: [-6.0, -51, -48], camOffset: [0, 0.6, 10.5], pieceSide: 1 },
    { id: "contact", anchor: [0, -64, -62], camOffset: [0, 0.6, 11.9], pieceSide: 0 },
];

export const SECTION_IDS = STATIONS.map((s) => s.id);

export const anchorOf = (id) => STATIONS.find((s) => s.id === id).anchor;
