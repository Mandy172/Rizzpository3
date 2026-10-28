import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../store/scroll.js';
import { parts } from '../data/parts.js';
import { MOTORCYCLE_CONFIG } from '../data/motorcycleConfig.js';

gsap.registerPlugin(ScrollTrigger);

export const ScrollContainer = () => {
  const containerRef = useRef(null);
  const setProgress = useScrollStore((s) => s.setProgress);
  const setScrollVelocity = useScrollStore((s) => s.setScrollVelocity);
  const progress = useScrollStore((s) => s.progress);
  const inspectionMode = useScrollStore((s) => s.inspectionMode);

  const totalSegments = 12;
  const currentSegIndex = Math.min(Math.floor(Math.max(0, progress) * totalSegments), totalSegments - 1);

  // Smooth scroll: Lenis wired to GSAP ScrollTrigger
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    window.__lenis = lenis;

    lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      setProgress(e.progress);
      setScrollVelocity(e.velocity);
    });

    const tickerUpdate = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      window.__lenis = null;
    };
  }, [setProgress, setScrollVelocity]);

  // Total height: (parts.length + 2) * 100vh = 1200vh
  const totalHeight = `${(parts.length + 2) * 100}vh`;

  if (inspectionMode) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="overlay-scroll-track relative w-full pointer-events-none z-10"
      style={{ height: totalHeight }}
    >
      {/* ================= STAGE 0: INTRO HERO ================= */}
      <section
        className={`h-screen w-full flex flex-col justify-center items-start px-8 md:px-16 pointer-events-none transition-opacity duration-200 ${
          currentSegIndex === 0 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-3xl pointer-events-auto">
          <div className="flex items-center gap-3 mb-2 font-mono text-xs text-accent tracking-widest uppercase">
            <span className="w-2 h-2 bg-accent inline-block"></span>
            A2 BENCHMARK // RACE TELEMETRY
          </div>
          <h1 className="font-anton text-6xl md:text-8xl tracking-tight text-text uppercase leading-none">
            {MOTORCYCLE_CONFIG.name}
          </h1>
          <div className="font-anton text-3xl md:text-5xl text-accent uppercase tracking-wider mb-4">
            ANATOMY // PARALLEL-TWIN
          </div>
          <p className="font-mono text-sm text-muted max-w-lg mb-6 leading-relaxed">
            High-fidelity 3D telemetry blueprint of the 47.6 horsepower Noale supersport.
            Scroll downward to inspect stage-by-stage chassis architecture.
          </p>
          <div className="inline-flex items-center gap-3 border border-blueprint px-4 py-2 bg-surface font-mono text-xs text-hud animate-pulse">
            <span>SCROLL TO INSPECT ANATOMY</span>
            <span>▼</span>
          </div>
        </div>
      </section>

      {/* ================= STAGES 1 TO 10: PARTS ================= */}
      {parts.map((part) => {
        const isCurrent = currentSegIndex === part.index + 1;
        return (
          <section
            key={part.id}
            className={`h-screen w-full flex flex-col justify-end p-8 md:p-16 pointer-events-none transition-opacity duration-150 ${
              isCurrent ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="max-w-xl pointer-events-auto bg-surface/90 border border-blueprint p-6 shadow-2xl">
              <div className="flex items-center gap-2 font-mono text-xs text-accent tracking-widest uppercase mb-1">
                <span>// STAGE 0{part.index + 1} OF 10</span>
                <span>—</span>
                <span className="text-hud">TELEMETRY LOCK</span>
              </div>
              <h2 className="font-anton text-4xl md:text-5xl text-text uppercase tracking-wide mb-2">
                {part.name}
              </h2>
              <div className="font-mono text-xs text-muted flex items-center gap-4 border-t border-subtle/50 pt-2 mt-2">
                <span>TARGET: {part.id.toUpperCase()}</span>
                <span>•</span>
                <span className="text-hud font-bold">RODIN 3D MESH</span>
                <span>•</span>
                <span>STATUS: NOMINAL</span>
              </div>
            </div>
          </section>
        );
      })}

      {/* ================= STAGE 11: OUTRO REASSEMBLY ================= */}
      <section
        className={`h-screen w-full flex flex-col justify-center items-center text-center px-8 pointer-events-none transition-opacity duration-200 ${
          currentSegIndex === 11 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-2xl pointer-events-auto bg-surface/95 border border-blueprint p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-2 font-mono text-xs text-hud tracking-widest uppercase mb-3">
            <span className="w-2 h-2 bg-hud animate-ping"></span>
            ALL 10 SYSTEMS SYNCHRONIZED // INSPECTION COMPLETE
          </div>
          <h2 className="font-anton text-5xl md:text-7xl text-text uppercase tracking-tight mb-4">
            RACE SPEC VALIDATED
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs border-y border-blueprint py-4 my-6">
            <div>
              <div className="text-muted text-[10px]">POWER</div>
              <div className="text-accent text-lg font-bold">{MOTORCYCLE_CONFIG.specs.power}</div>
            </div>
            <div>
              <div className="text-muted text-[10px]">TORQUE</div>
              <div className="text-text text-lg font-bold">{MOTORCYCLE_CONFIG.specs.torque}</div>
            </div>
            <div>
              <div className="text-muted text-[10px]">DISPLACEMENT</div>
              <div className="text-hud text-lg font-bold">{MOTORCYCLE_CONFIG.specs.displacement}</div>
            </div>
            <div>
              <div className="text-muted text-[10px]">KERB WEIGHT</div>
              <div className="text-text text-lg font-bold">{MOTORCYCLE_CONFIG.specs.kerbWeight}</div>
            </div>
          </div>
          <p className="font-mono text-xs text-muted max-w-md mx-auto leading-relaxed">
            Scroll back up to review individual sub-assemblies, or switch to 360° Inspect mode in the top HUD.
          </p>
        </div>
      </section>
    </div>
  );
};
