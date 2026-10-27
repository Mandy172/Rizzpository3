# RSV4 — FACTORY
### An immersive 3D scroll experience built for the 2024 Aprilia RSV4 Factory.

> Unofficial fan project · Not affiliated with Aprilia or Piaggio Group

---

<!-- Add a GIF/video of the scroll experience here once deployed -->
<!-- ![RSV4 Experience demo](./demo.gif) -->

---

## What is this?

Scroll through every component that makes the RSV4 Factory the most sophisticated production superbike on the planet. Ten parts, ten sections, one bike — all in real-time 3D.

Boot the ECU. Watch the RPM sweep. Keep scrolling.

---

## Tech Stack

| Layer | Tools |
|-------|-------|
| 3D    | Three.js, React Three Fiber, Drei |
| Scroll | Lenis smooth scroll |
| State  | Zustand |
| Framework | React 18 + Vite |
| Fonts  | JetBrains Mono |
| Deploy | Vercel |
| Model  | GLB via Sketchfab (CC BY 4.0) + gltf-transform (Draco + 2048 tex) |

---

## Team

| Name | Role |
|------|------|
| **Sujay** | 3D scene, lighting, model animation |
| **Manas** | Core architecture, scroll engine, store |
| **Kritagya** | Data, HUD, product & polish |

---

## Getting Started

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production bundle
```

---

## Data Sources

All Aprilia RSV4 specifications are sourced from:
- [aprilia.com/en_EN/bikes/rsv4/rsv4-factory/](https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/)
- Cross-referenced with motorcyclespecs.co.za and motorcycle.com

---

## Disclaimer

This is an **unofficial fan project** created for educational and creative purposes.  
Not affiliated with, endorsed by, or sponsored by **Aprilia Racing S.r.l.** or **Piaggio & C. S.p.A.**  
All trademarks, brand names, and product names are the property of their respective owners.
