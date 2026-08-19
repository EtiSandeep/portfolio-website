# sandeepeti.com

Portfolio site for Sandeep Eti, built as a single continuous 3D space. Scrolling the page
flies a camera through that space; each section of copy is a stop on the route with its own
set piece rendered behind it.

## Running it

```bash
npm install
npm run dev      # vite dev server
npm run build    # production build into dist/
npm run preview  # serve the build
npm run deploy   # build + publish dist/ to gh-pages
```

## How the 3D layer works

Everything lives in one fixed `<canvas>` behind the DOM (`src/components/SceneCanvas.jsx`),
lazily imported so the copy paints before three.js is fetched.

- **`src/three/stations.js`** — the camera route. One entry per section: where its set piece
  sits in world space, where the camera parks, which half of the screen the piece should take
  on a wide viewport, and how far down the frame to push it.
- **`src/three/store.js`** — scroll position and pointer, kept out of React state. The page's
  real section geometry is measured, so DOM sections and camera stations stay in lockstep
  even as content reflows.
- **`src/three/Rig.jsx`** — flies the camera between stations, with pointer parallax, a
  speed-reactive dolly, and an aspect-ratio pull that keeps the framing sane on phones.
- **`src/three/palette.js`** — day and night as two palettes of *live* `THREE.Color` objects.
  Materials hold references to those objects, so `Atmosphere` can crossfade the entire world
  by mutating them in place — no material rebuilds, no re-renders.

Set pieces, one per section: `Nucleus` (home), `CrystalBloom` (about), `CareerHelix`
(experience), `SkillConstellation` (skills), `Monoliths` (projects), `Portal` (contact), plus
a global `StarDust` field and a gradient `SkyDome`.

### Two things worth knowing before editing shaders

- **Fog is hand-rolled.** Every material here is a custom `ShaderMaterial`, so `scene.fog`
  would do nothing. `src/three/glsl/fog.js` supplies the chunks instead — opaque surfaces mix
  toward the sky colour, additive glows fade their alpha. Skip it on a new material and that
  material will punch a hard silhouette through the sky from across the world.
- **Additive blending alone doesn't work in the day theme.** Adding light to a bright sky just
  washes toward the background. Anything that has to read in both themes (the constellation's
  nodes and links, for instance) paints with alpha and a `line` palette colour instead.

## Degrading gracefully

`useQuality` picks a budget once at mount from device hints and drops particle counts,
device pixel ratio and postprocessing accordingly; `prefers-reduced-motion` slows the whole
world rather than freezing it. If WebGL is missing — or the device is low-tier enough that the
canvas stops drawing skill labels — the Skills section renders the full list in the DOM and the
page falls back to a gradient backdrop.

## Stack

React 19, Vite, Tailwind, Framer Motion, three.js via @react-three/fiber + drei +
@react-three/postprocessing.
