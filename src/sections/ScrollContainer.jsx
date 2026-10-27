import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrollStore } from '../store/scroll.js';
import { parts } from '../data/parts.js';

gsap.registerPlugin(ScrollTrigger);

export const ScrollContainer = () => {
  const containerRef = useRef(null);
  const setProgress = useScrollStore((s) => s.setProgress);
  const setScrollVelocity = useScrollStore((s) => s.setScrollVelocity);
  const progress = useScrollStore((s) => s.progress);

  const totalSegments = 12;
  const currentSegIndex = Math.min(Math.floor(Math.max(0, progress) * totalSegments), totalSegments - 1);

  // 3. Smooth scroll: Lenis wired to GSAP ScrollTrigger
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

  return (
    <div
      ref={containerRef}
      className="relative w-full pointer-events-none z-10"
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
            NO COMPROMISE // RACE TELEMETRY
          </div>
          <h1 className="font-anton text-6xl md:text-8xl tracking-tight text-text uppercase leading-none">
            APRILIA RSV4
          </h1>
          <div className="font-anton text-3xl md:text-5xl text-accent uppercase tracking-wider mb-4">
            ANATOMY // FACTORY 1100
          </div>
          <p className="font-mono text-sm text-muted max-w-lg mb-6 leading-relaxed">
            Exploded technical blueprint of the 217 horsepower Noale superbike.
            Scroll downward to initiate stage-by-stage mechanical disassembly.
          </p>
          <div className="inline-flex items-center gap-3 border border-blueprint px-4 py-2 bg-surface font-mono text-xs text-hud animate-pulse">
            <span>SCROLL TO DISASSEMBLE</span>
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
                <span>EXPLODE STATE: ACTIVE</span>
                <span>•</span>
                <span className="text-hud font-bold">GSAP SCRUBBED</span>
                <span>•</span>
                <span>SYSTEM: {part.id.toUpperCase()}</span>
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
            ALL 10 SYSTEMS SYNCHRONIZED // REASSEMBLY COMPLETE
          </div>
          <h2 className="font-anton text-5xl md:text-7xl text-text uppercase tracking-tight mb-4">
            RACE SPEC VALIDATED
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs border-y border-blueprint py-4 my-6">
            <div>
              <div className="text-muted text-[10px]">POWER</div>
              <div className="text-accent text-lg font-bold">217 HP</div>
            </div>
            <div>
              <div className="text-muted text-[10px]">TORQUE</div>
              <div className="text-text text-lg font-bold">125 NM</div>
            </div>
            <div>
              <div className="text-muted text-[10px]">DISPLACEMENT</div>
              <div className="text-hud text-lg font-bold">1,099 CC</div>
            </div>
            <div>
              <div className="text-muted text-[10px]">WEIGHT</div>
              <div className="text-text text-lg font-bold">199 KG</div>
            </div>
          </div>
          <p className="font-mono text-xs text-muted max-w-md mx-auto leading-relaxed">
            Scroll back up to inspect individual sub-assemblies, or click any component directly on the 3D model canvas.
          </p>
        </div>
      </section>
    </div>
  );
};
