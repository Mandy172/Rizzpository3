# APRILIA RSV4 // ANATOMY
Unofficial fan hackathon project exploring the race-bred engineering and telemetry of the Aprilia RSV4 1100 Factory.

## Tech Stack
- Vite + React
- Three.js / @react-three/fiber / @react-three/drei / @react-three/postprocessing
- GSAP + ScrollTrigger
- Lenis Smooth Scroll
- Zustand
- Tailwind CSS

## Team Folder Ownership Table

| Path | Owner | Description |
|------|-------|-------------|
| `src/three/` | **Sujay** | 3D Canvas, WebGL model loading, explode system, scroll choreography, camera rig, shaders, studio scene, postprocessing |
| `src/sections/`, `src/styles/` | **Manas** | DOM overlay sections, typography reveals, telemetry UI, layout styling |
| `src/hud/`, `src/data/`, `public/` | **Kritagya** | Technical HUD overlays, parts database, telemetry metrics, static 3D assets |
| `src/store/scroll.js` | **Shared Contract** | Shared Zustand state store (progress, velocity, activePartId, hoveredPart, activePartScreenPos, modelReady, muted, lowPower) |

## Disclaimer & Credits
- Unofficial fan project. Not affiliated with Aprilia.
- 3D Model Author & Procedural Geometry: Sujay & Open Engineering Assets.
