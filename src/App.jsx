import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollStore } from "./store/scroll.js";
import { parts } from "./data/parts.js";
import ThreeCanvas from "./three/Canvas.jsx";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const setProgress = useScrollStore((s) => s.setProgress);
  const setScrollVelocity = useScrollStore((s) => s.setScrollVelocity);
  const setActivePartId = useScrollStore((s) => s.setActivePartId);

  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ({ scroll, limit, velocity }) => {
      ScrollTrigger.update();

      const progress = limit > 0 ? scroll / limit : 0;
      setProgress(progress);
      setScrollVelocity(velocity || 0);

      const partIndex = Math.min(
        Math.floor(progress * parts.length),
        parts.length - 1
      );
      setActivePartId(parts[partIndex]?.id || null);
    });

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, [setProgress, setScrollVelocity, setActivePartId]);

  return (
    <div style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      {/* 4. Fixed full-screen <Canvas> behind the DOM (z-index 0), pointer-events enabled */}
      <ThreeCanvas />

      {/* DOM overlay above it with pointer-events: none by default */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          pointerEvents: "none",
          width: "100%",
        }}
      >
        {/* 3. A scroll container of (parts.length + 2) * 100vh */}
        <div
          style={{
            height: `${(parts.length + 2) * 100}vh`,
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
