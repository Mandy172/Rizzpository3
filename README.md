# APRILIA RSV4 // ANATOMY (RSV4 FACTORY)
### An immersive 3D WebGL scroll experience built for the Aprilia RSV4 1100 Factory.

> Unofficial fan project · Not affiliated with Aprilia Racing S.r.l. or Piaggio & C. S.p.A.

---

## What is this?

Scroll through every component that makes the RSV4 Factory the most sophisticated production superbike on the planet. Ten parts, ten sections, one bike — all in real-time 3D tech-brutalist telemetry aesthetics.

---

## Tech Stack

| Layer | Tools |
|-------|-------|
| 3D | Three.js, React Three Fiber, Drei, Postprocessing |
| Scroll | Lenis smooth scroll + GSAP ScrollTrigger |
| State | Zustand |
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Fonts | Anton, JetBrains Mono, Space Grotesk |

---

## Team & Folder Ownership

| Path | Owner | Description |
|------|-------|-------------|
| `src/three/` | **Sujay** | 3D Canvas, WebGL model loading, explode system, scroll choreography, camera rig, shaders, studio scene, postprocessing |
| `src/sections/`, `src/styles/` | **Manas** | DOM overlay sections, typography reveals, telemetry UI, layout styling |
| `src/hud/`, `src/data/`, `public/` | **Kritagya** | Technical HUD overlays, parts database, telemetry metrics, static 3D assets |
| `src/store/scroll.js` | **Shared Contract** | Shared Zustand state store (progress, velocity, activePartId, hoveredPart, activePartScreenPos, modelReady, muted, lowPower) |

---

## Getting Started

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production bundle
```

## Arcade Drive Mode (RS 660)

Open `/drive` in the running app, or use the **RS 660 DRIVE** link on the anatomy page. The driving scene expects a model at `public/models/aprilia-rs660.glb`; add it only if the [Sketchfab model](https://sketchfab.com/3d-models/aprilia-rs-660-2024-9c150ae84c364ffcb09778bec610d17e) is downloadable under terms that allow this use. Record the creator and license in `src/drive/Drive.jsx` before publishing. Controls: **WASD** or the **arrow keys**.

---

## Data Sources & Credits

All Aprilia RSV4 specifications are sourced from:
- [aprilia.com/en_EN/bikes/rsv4/rsv4-factory/](https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/)
- Cross-referenced with motorcyclespecs.co.za and motorcycle.com
- 3D Model Author & Procedural Geometry: Sujay & Open Engineering Assets.

---

## Disclaimer

This is an **unofficial fan project** created for educational and creative purposes.  
Not affiliated with, endorsed by, or sponsored by **Aprilia Racing S.r.l.** or **Piaggio & C. S.p.A.**  
All trademarks, brand names, and product names are the property of their respective owners.
