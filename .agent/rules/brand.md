# PROJECT: APRILIA RSV4 // ANATOMY (unofficial fan hackathon project)

## Vibe
Tech-brutalist. Race-bred. Aggressive. Think MotoGP telemetry screen meets
architectural blueprint. NEVER soft, NEVER cute, NEVER generic SaaS.

## Design tokens
- bg: #0a0a0a | surface: #121212 | text: #f2f2f0 | muted: #8a8a85
- accent (Aprilia red): #e10600 | HUD readouts only: #d4ff00
- Fonts: Anton (giant condensed uppercase headings), JetBrains Mono (labels/specs),
  Space Grotesk (rare body text)
- border-radius: 0 everywhere. Borders: 1px solid rgba(242,242,240,0.18)
- No gradients except subtle red glows on the 3D canvas. No soft box-shadows.
- Motion: hard cuts, clip-path wipes, line-mask text reveals, power3.inOut easing.
  No bouncy springs, no fade-only transitions.

## Stack
Vite + React, three, @react-three/fiber, @react-three/drei, @react-three/postprocessing,
gsap (+ ScrollTrigger), lenis, zustand, tailwindcss.

## Folder ownership (do NOT edit outside your folder)
- src/three/      -> Sujay
- src/sections/, src/styles/ -> Manas
- src/hud/, src/data/, public/ -> Kritagya
- src/store/scroll.js -> shared contract, change only after telling the team

## Rules
- Read state from the zustand store; only src/three/ writes progress, activePartId,
  hoveredPart, activePartScreenPos.
- Parts order in src/data/parts.js = scroll order.
- Never use the official Aprilia logo image. Use a text wordmark.
- Footer must say: "Unofficial fan project. Not affiliated with Aprilia."
- Credit the 3D model author in the footer.
- Keep 60fps. Dispose geometries/materials. No giant unoptimized assets.
- After every big change: run the dev server, open the browser, screenshot,
  critique against the vibe above, and fix before finishing.
