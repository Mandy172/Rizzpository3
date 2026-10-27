/**
 * Global app store — Zustand
 * HUD components READ from this store only.
 * Only the scene / scroll manager WRITES to it.
 */
import { create } from "zustand";
import { PART_IDS } from "../data/parts.js";

export const useStore = create((set, get) => ({
  // ── Preloader ──────────────────────────────────────────────────────────────
  modelReady: false,
  setModelReady: (v) => set({ modelReady: v }),

  // ── Scroll ────────────────────────────────────────────────────────────────
  /** 0..1 normalised scroll progress across all 10 parts */
  scrollProgress: 0,
  setScrollProgress: (v) => set({ scrollProgress: v }),

  /** Instantaneous scroll velocity (px/s) — drives RPM animation */
  scrollVelocity: 0,
  setScrollVelocity: (v) => set({ scrollVelocity: v }),

  // ── Active Part ───────────────────────────────────────────────────────────
  /** 0-based index of the currently visible part */
  activePart: 0,
  setActivePart: (i) => set({ activePart: i }),

  // ── Hovered Part (3D scene) ───────────────────────────────────────────────
  hoveredPart: null,
  setHoveredPart: (name) => set({ hoveredPart: name }),

  // ── Audio ─────────────────────────────────────────────────────────────────
  muted: false,
  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  // ── Device capabilities ───────────────────────────────────────────────────
  lowPower: false,
  setLowPower: (v) => set({ lowPower: v }),

  isTouch: false,
  setIsTouch: (v) => set({ isTouch: v }),

  // ── Derived helpers ───────────────────────────────────────────────────────
  /** Gear indicator: part index → gear string */
  get gear() {
    const idx = get().activePart;
    return String(Math.min(idx + 1, 6));
  },

  /** RPM: driven by scroll velocity with idle fallback */
  get rpm() {
    const vel = Math.abs(get().scrollVelocity);
    const idle = 3500;
    const max = 13000;
    const computed = idle + Math.min(vel * 40, max - idle);
    return Math.round(computed);
  },

  /** Fake speed: linearly proportional to RPM */
  get speed() {
    const r = get().rpm;
    return Math.round((r / 13000) * 299);
  },
}));
