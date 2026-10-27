# GEMINI.md — RSV4 Experience: Team Contract

## Ownership Map

| Area | Owner | Path(s) |
|------|-------|---------|
| 3D Scene, camera, model | **Sujay** | `src/components/Scene.jsx` |
| Core architecture, scroll, store | **Manas** | `src/store/`, `src/hooks/`, `App.jsx` |
| Data, HUD, product | **Kritagya** | `src/data/`, `src/hud/`, `public/` |

---

## Store Contract

The Zustand store (`src/store/useStore.js`) is the **single source of truth**.

### Who writes what

| Field | Written by |
|-------|-----------|
| `modelReady` | Scene (call `setModelReady(true)` after GLB loads) |
| `hoveredPart` | Scene (on mesh `onPointerOver`/`onPointerOut`) |
| `scrollProgress` | App.jsx (Lenis scroll handler) |
| `scrollVelocity` | App.jsx (Lenis scroll handler) |
| `activePart` | App.jsx (derived from scroll) |
| `muted` | HUD mute toggle (user action) |
| `lowPower` | App.jsx (device detection on mount) |
| `isTouch` | App.jsx (device detection on mount) |

### Rules
1. **HUD components are read-only** — they never call setters except `toggleMuted`.
2. **Scene reads** `activePart`, `lowPower`, `hoveredPart`.
3. **No prop drilling** — everything goes through the store.

---

## Design Language

| Token | Value | Use |
|-------|-------|-----|
| `--accent` | `#d4ff00` | Numbers, active states, progress |
| `--red` | `#ff2200` | Redline, active nav item, alerts |
| `--bg` | `#000` | Background |
| `--font` | JetBrains Mono | Everything |

- Labels: ALL CAPS, 0.55–0.65rem, letter-spacing 0.15–0.25em, `#333–#555`
- Values: `#d4ff00`, bold, larger than labels
- No drop shadows on text. No gradients on type.
- Red is reserved for **danger / redline / alert** only.

---

## Data Integrity

- All specs in `src/data/parts.js` are sourced from `aprilia.com` or verified reviews.
- Each part has a `source` URL.
- No invented numbers. Approximates are marked with `~`.

---

## QA Checklist (run before every PR)

- [ ] `npm run build` exits 0
- [ ] Lighthouse performance ≥ 80 on mobile
- [ ] No console errors in production build
- [ ] Preloader fires → RPM sweeps → wipe on modelReady
- [ ] HUD RPM reacts to scroll velocity
- [ ] PartNavigator scrolls to correct section
- [ ] Cursor disabled on touch (`isTouch === true`)
- [ ] `muted` toggle works in both Preloader and HUD

---

## Unverified / Approximate Values (to confirm)

- Winglet downforce figures — no official Nm/kN number published; kept qualitative.
- Exhaust manifold temperature — not quoted; omitted from specs.
- Cockpit handlebar angle — not in official spec sheet; omitted.
