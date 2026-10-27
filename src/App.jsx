/**
 * App.jsx — Root component
 * Owns: Lenis smooth scroll wired to GSAP ScrollTrigger, store wiring, 3D Canvas, and Brutalist Sections
 */
import { useEffect, useRef, useCallback, lazy, Suspense } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useStore } from "./store/useStore.js";
import { useScrollStore } from "./store/scroll.js";
import { Preloader, HUD, PartNavigator, Cursor } from "./hud/index.js";
import { PARTS } from "./data/parts.js";

// Tech-brutalist overlays
import Frame from "./sections/Frame.jsx";
import Hero from "./sections/Hero.jsx";
import InfoPanel from "./sections/InfoPanel.jsx";
import StatSection from "./sections/StatSection.jsx";
import Marquee from "./sections/Marquee.jsx";
import Finale from "./sections/Finale.jsx";

// 3D Scene (Sujay/Manas)
const Scene = lazy(() => import("./components/Scene.jsx"));

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

      {/* 3D Scene fixed behind DOM */}
      <Suspense fallback={null}>
        <Scene onReady={handleModelReady} />
      </Suspense>

      {/* Tech-Brutalist Product Overlays */}
      <Frame />
      <Hero />
      <InfoPanel />
      <StatSection />
      <Marquee />
      <Finale />

      {/* Scrollable container of (parts.length + 2) * 100vh */}
      <main
        className="scroll-content"
        style={{
          minHeight: `${(TOTAL_PARTS + 2) * 100}vh`,
          pointerEvents: "none",
        }}
      >
        {PARTS.map((part) => (
          <section key={part.id} id={part.id} className="part-section" />
        ))}
      </main>
    </>
  );
}
