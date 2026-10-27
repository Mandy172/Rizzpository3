/**
 * App.jsx — Root component
 * Owns: Lenis smooth scroll wired to GSAP ScrollTrigger, store wiring, 3D Canvas
 */
import { useEffect, useRef, useCallback } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStore } from "./store/useStore.js";
import { useScrollStore } from "./store/scroll.js";
import { Preloader, HUD, PartNavigator, Cursor } from "./hud/index.js";
import { PARTS } from "./data/parts.js";
import SceneCanvas from "./three/SceneCanvas.jsx";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_PARTS = PARTS.length;

export default function App() {
  const setScrollProgress = useStore((s) => s.setScrollProgress);
  const setScrollVelocity = useStore((s) => s.setScrollVelocity);
  const setActivePart = useStore((s) => s.setActivePart);
  const setIsTouch = useStore((s) => s.setIsTouch);
  const setLowPower = useStore((s) => s.setLowPower);
  const setModelReady = useStore((s) => s.setModelReady);

  const setProgress = useScrollStore((s) => s.setProgress);
  const setVelocity = useScrollStore((s) => s.setScrollVelocity);
  const setActivePartId = useScrollStore((s) => s.setActivePartId);
  const setScrollModelReady = useScrollStore((s) => s.setModelReady);

  const lenisRef = useRef(null);
  const velTimer = useRef(null);
  const lastScroll = useRef(0);
  const lastTime = useRef(performance.now());

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

  // Init Lenis smooth scroll wired to GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on("scroll", ({ scroll, limit, velocity }) => {
      ScrollTrigger.update();

      const progress = limit > 0 ? scroll / limit : 0;
      setScrollProgress(progress);
      setProgress(progress);

      const idx = Math.min(Math.floor(progress * TOTAL_PARTS), TOTAL_PARTS - 1);
      setActivePart(idx);
      setActivePartId(PARTS[idx]?.id || null);

      const now = performance.now();
      const dt = now - lastTime.current;
      const dy = scroll - lastScroll.current;
      lastTime.current = now;
      lastScroll.current = scroll;
      const vel = dt > 0 ? Math.abs(dy / dt) * 1000 : 0;

      setScrollVelocity(vel);
      setVelocity(vel);

      clearTimeout(velTimer.current);
      velTimer.current = setTimeout(() => {
        setScrollVelocity(0);
        setVelocity(0);
      }, 300);
    });

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      clearTimeout(velTimer.current);
    };
  }, [setScrollProgress, setScrollVelocity, setActivePart, setProgress, setVelocity, setActivePartId]);

  const handleModelReady = useCallback(() => {
    setModelReady(true);
    setScrollModelReady(true);
  }, [setModelReady, setScrollModelReady]);

  return (
    <>
      <Cursor />
      <Preloader />
      <HUD />
      <PartNavigator lenisRef={lenisRef} />

      {/* Fixed full-screen Canvas behind DOM */}
      <SceneCanvas onReady={handleModelReady} />

      {/* Scrollable container of (parts.length + 2) * 100vh */}
      <main
        className="scroll-content"
        style={{
          minHeight: `${(TOTAL_PARTS + 2) * 100}vh`,
          pointerEvents: "none",
        }}
      >
        {PARTS.map((part) => (
          <section key={part.id} id={part.id} className="part-section">
            <div className="part-section__info" style={{ pointerEvents: "auto" }}>
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
