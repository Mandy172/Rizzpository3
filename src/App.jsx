/**
 * App.jsx — Root component
 * Owns: Lenis smooth scroll, scroll progress tracking, HUD wiring
 * Scene (3D) is owned by Sujay/Manas — this just mounts their <Scene /> component
 */
import { useEffect, useRef, useCallback } from "react";
import Lenis from "lenis";
import { useStore } from "./store/useStore.js";
import { Preloader, HUD, PartNavigator, Cursor } from "./hud/index.js";
import Sections from "./sections";
import { PARTS } from "./data/parts.js";

// Lazy-load the 3D scene (Sujay/Manas own this)
import { lazy, Suspense } from "react";
const Scene = lazy(() => import("./components/Scene.jsx"));

const TOTAL_PARTS = PARTS.length;

export default function App() {
  const setScrollProgress = useStore((s) => s.setScrollProgress);
  const setScrollVelocity  = useStore((s) => s.setScrollVelocity);
  const setActivePart      = useStore((s) => s.setActivePart);
  const setIsTouch         = useStore((s) => s.setIsTouch);
  const setLowPower        = useStore((s) => s.setLowPower);
  const setModelReady      = useStore((s) => s.setModelReady);

  const lenisRef  = useRef(null);
  const velTimer  = useRef(null);
  const lastScroll = useRef(0);
  const lastTime   = useRef(performance.now());

  // Detect touch device
  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none)").matches || navigator.maxTouchPoints > 0);
  }, [setIsTouch]);

  // Detect low-power / slow device
  useEffect(() => {
    const nav = navigator;
    if (nav.deviceMemory && nav.deviceMemory < 4) setLowPower(true);
    if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) setLowPower(true);
  }, [setLowPower]);

  // Init Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on("scroll", ({ scroll, limit, velocity }) => {
      const progress = scroll / limit;
      setScrollProgress(progress);

      // Active part by scroll progress
      const idx = Math.min(Math.floor(progress * TOTAL_PARTS), TOTAL_PARTS - 1);
      setActivePart(idx);

      // Velocity (compute manually for smoother RPM)
      const now = performance.now();
      const dt = now - lastTime.current;
      const dy = scroll - lastScroll.current;
      lastTime.current = now;
      lastScroll.current = scroll;
      const vel = dt > 0 ? Math.abs(dy / dt) * 1000 : 0;
      setScrollVelocity(vel);

      // Decay velocity to idle
      clearTimeout(velTimer.current);
      velTimer.current = setTimeout(() => setScrollVelocity(0), 300);
    });

    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    return () => { lenis.destroy(); clearTimeout(velTimer.current); };
  }, [setScrollProgress, setScrollVelocity, setActivePart]);

  // Expose setModelReady for Scene to call
  const handleModelReady = useCallback(() => setModelReady(true), [setModelReady]);

  return (
    <>
      <Cursor />
      <Preloader />
      <HUD />
      <PartNavigator lenisRef={lenisRef} />

      <Sections />

      {/* 3D Scene — lazy-loaded; Scene calls onReady() when model is loaded */}
      <Suspense fallback={null}>
        <Scene onReady={handleModelReady} />
      </Suspense>

      {/* Scrollable content sections (10 parts × 100vh each) */}
      <main className="scroll-content">
        {PARTS.map((part) => (
          <section key={part.id} id={part.id} className="part-section">
            {/* Part info panel — minimal, Scene overlays the bike */}
            <div className="part-section__info">
              <div className="part-section__index">[{part.index}]</div>
              <h2 className="part-section__name">{part.name}</h2>
              <p className="part-section__pitch">{part.pitch}</p>
              <ul className="part-section__specs">
                {part.specs.map(([label, val]) => (
                  <li key={label}>
                    <span className="spec-label">{label}</span>
                    <span className="spec-value">{val}</span>
                  </li>
                ))}
              </ul>
              <p className="part-section__why">{part.why}</p>
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
