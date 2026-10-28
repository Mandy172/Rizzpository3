import React, { useState, useEffect, useRef } from 'react';
import { useScrollStore } from '../store/scroll.js';
import { parts } from '../data/parts.js';
import { MOTORCYCLE_CONFIG } from '../data/motorcycleConfig.js';
import { MODEL_CREDIT } from '../data/credits.js';

export const HUDOverlay = () => {
  const activePartId = useScrollStore((s) => s.activePartId);
  const hoveredPart = useScrollStore((s) => s.hoveredPart);
  const activePartScreenPos = useScrollStore((s) => s.activePartScreenPos);
  const progress = useScrollStore((s) => s.progress);
  const scrollVelocity = useScrollStore((s) => s.scrollVelocity);
  const lowPower = useScrollStore((s) => s.lowPower);
  const setLowPower = useScrollStore((s) => s.setLowPower);
  const muted = useScrollStore((s) => s.muted);
  const setMuted = useScrollStore((s) => s.setMuted);
  const inspectionMode = useScrollStore((s) => s.inspectionMode);
  const toggleInspectionMode = useScrollStore((s) => s.toggleInspectionMode);
  const inspectionView = useScrollStore((s) => s.inspectionView);
  const setInspectionView = useScrollStore((s) => s.setInspectionView);
  const livery = useScrollStore((s) => s.livery);
  const setLivery = useScrollStore((s) => s.setLivery);
  const xrayMode = useScrollStore((s) => s.xrayMode);
  const toggleXrayMode = useScrollStore((s) => s.toggleXrayMode);
  const isRevving = useScrollStore((s) => s.isRevving);
  const setIsRevving = useScrollStore((s) => s.setIsRevving);

  const [showHotkeys, setShowHotkeys] = useState(false);
  const activePart = parts.find((p) => p.id === activePartId);

  // Target telemetry values
  const targetRpm = isRevving
    ? 10250 + Math.round(Math.sin(Date.now() * 0.04) * 250)
    : Math.round(MOTORCYCLE_CONFIG.specs.idleRpm + progress * (MOTORCYCLE_CONFIG.specs.maxRpm - MOTORCYCLE_CONFIG.specs.idleRpm));
  const targetSpeed = isRevving
    ? Math.max(Math.round(progress * 185), 142)
    : Math.round(progress * 185);
  const gear = isRevving
    ? '5'
    : progress < 0.08 ? 'N' : progress < 0.22 ? '1' : progress < 0.4 ? '2' : progress < 0.6 ? '3' : progress < 0.8 ? '4' : progress < 0.95 ? '5' : '6';
  const leanAngle = Math.sin(progress * Math.PI * 4) * 44;

  // Global Keyboard Shortcuts (Space to rev, X for xray, C for livery, I for inspect, 1-0 for parts)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsRevving(true);
      } else if (e.key === 'x' || e.key === 'X') {
        toggleXrayMode();
      } else if (e.key === 'c' || e.key === 'C') {
        setLivery(livery === 'racing' ? 'prismatic' : livery === 'prismatic' ? 'acid-gold' : 'racing');
      } else if (e.key === 'i' || e.key === 'I') {
        toggleInspectionMode();
      } else if (e.key === 'm' || e.key === 'M') {
        setMuted((m) => !m);
      } else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      } else if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10);
        if (window.__lenis) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          window.__lenis.scrollTo((idx / 12) * maxScroll);
        }
      } else if (e.key === '0') {
        if (window.__lenis) {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          window.__lenis.scrollTo((10 / 12) * maxScroll);
        }
      } else if (e.key === '?') {
        setShowHotkeys((s) => !s);
      }
    };

    const onKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsRevving(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [setIsRevving, toggleXrayMode, setLivery, toggleInspectionMode, setMuted, livery]);

  // Smoothed numeric displays for racing gauge realism
  const [smoothRpm, setSmoothRpm] = useState(targetRpm);
  const [smoothSpeed, setSmoothSpeed] = useState(targetSpeed);
  const rafRef = useRef();

  useEffect(() => {
    const updateGauges = () => {
      setSmoothRpm((prev) => {
        const diff = targetRpm - prev;
        if (Math.abs(diff) < 2) return targetRpm;
        return Math.round(prev + diff * 0.14);
      });
      setSmoothSpeed((prev) => {
        const diff = targetSpeed - prev;
        if (Math.abs(diff) < 1) return targetSpeed;
        return Math.round(prev + diff * 0.12);
      });
      rafRef.current = requestAnimationFrame(updateGauges);
    };
    rafRef.current = requestAnimationFrame(updateGauges);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetRpm, targetSpeed]);

  // Tachometer 20-segment calculation
  const rpmPercent = Math.max(0, Math.min(1, (smoothRpm - MOTORCYCLE_CONFIG.specs.idleRpm) / (MOTORCYCLE_CONFIG.specs.maxRpm - MOTORCYCLE_CONFIG.specs.idleRpm)));
  const totalSegments = 20;
  const litSegments = Math.round(rpmPercent * totalSegments);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 select-none">
      
      {/* ================= HEADER BAR ================= */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-subtle pb-4 pointer-events-auto gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-accent inline-block animate-pulse"></span>
            <span className="font-anton text-2xl tracking-wider text-text uppercase">
              {MOTORCYCLE_CONFIG.name} // PARALLEL-TWIN RACING
            </span>
          </div>
          <span className="font-mono text-xs text-muted tracking-widest mt-1">
            ANATOMY TELEMETRY SYSTEM // TECHNICAL CONCEPT
          </span>
        </div>

        {/* Global HUD Quick Controls & 360° Inspection Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Livery / Colorway Selector Toolbar */}
          <div className="flex items-center gap-1 bg-surface border border-blueprint p-1">
            <span className="font-mono text-[9px] text-muted px-1.5 hidden lg:inline">LIVERY:</span>
            {[
              { id: 'racing', label: 'SQUADRA', dot: '#e10600' },
              { id: 'prismatic', label: 'PRISMATIC', dot: '#a855f7' },
              { id: 'acid-gold', label: 'GOLD', dot: '#d4ff00' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setLivery(item.id)}
                className={`flex items-center gap-1.5 font-mono text-[10px] px-2 py-1 transition-colors ${
                  livery === item.id ? 'bg-white/10 text-text font-bold border-b border-accent' : 'text-muted hover:text-text'
                }`}
                title={`Switch to ${item.label} livery [C]`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.dot }} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* X-Ray / Blueprint Mode Toggle */}
          <button
            onClick={toggleXrayMode}
            className={`font-mono text-xs px-3 py-1.5 border transition-all ${
              xrayMode
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                : 'bg-surface text-text border-blueprint hover:border-cyan-400'
            }`}
            title="Toggle X-Ray / Blueprint Hologram [X]"
          >
            {xrayMode ? '✦ X-RAY ACTIVE' : 'X-RAY'}
          </button>

          {/* 360° Inspection Mode Toggle */}
          <button
            onClick={toggleInspectionMode}
            className={`font-mono text-xs px-3 py-1.5 border transition-colors ${
              inspectionMode
                ? 'bg-accent text-white font-bold border-accent shadow-lg shadow-accent/20'
                : 'bg-surface text-text border-blueprint hover:border-accent'
            }`}
          >
            {inspectionMode ? '✦ 360° ACTIVE' : '360°'}
          </button>

          {/* Quick Camera Angle Buttons in Inspection Mode */}
          {inspectionMode && (
            <div className="flex items-center gap-1 bg-surface border border-blueprint p-1">
              {[
                { id: 'default', label: 'HERO' },
                { id: 'engine', label: 'ENGINE' },
                { id: 'front', label: 'FRONT' },
                { id: 'side', label: 'SIDE' },
                { id: 'cockpit', label: 'COCKPIT' },
                { id: 'rear', label: 'REAR' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setInspectionView(btn.id)}
                  className={`font-mono text-[10px] px-2 py-1 transition-colors ${
                    inspectionView === btn.id ? 'bg-hud text-bg font-bold' : 'text-muted hover:text-text'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}

          {/* Low Power Toggle */}
          <button
            onClick={() => setLowPower((prev) => !prev)}
            className={`font-mono text-xs px-3 py-1.5 border border-blueprint transition-colors ${
              lowPower ? 'bg-hud text-bg font-bold' : 'bg-surface text-text hover:border-accent'
            }`}
          >
            PWR: {lowPower ? 'LOW' : 'ULTRA'}
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={() => setMuted((prev) => !prev)}
            className={`font-mono text-xs px-3 py-1.5 border border-blueprint transition-colors ${
              muted ? 'bg-surface text-muted' : 'bg-accent text-white font-bold'
            }`}
            title="Mute / Unmute Audio [M]"
          >
            {muted ? 'MUTED' : 'LIVE 🔊'}
          </button>

          {/* Hotkeys Quick Reference Pill */}
          <button
            onClick={() => setShowHotkeys((s) => !s)}
            className="font-mono text-xs px-2.5 py-1.5 border border-blueprint bg-surface text-muted hover:text-hud hover:border-hud transition-colors"
            title="Keyboard Shortcuts [?]"
          >
            KEYS ?
          </button>

          {/* Telemetry Stage Index */}
          <div className="border border-blueprint px-3 py-1 bg-surface font-mono text-xs text-hud">
            STAGE: {activePart ? `0${activePart.index + 1}/10` : progress > 0.8 ? 'COMPLETE' : 'STANDBY'}
          </div>
        </div>
      </header>

      {/* ================= TACHOMETER LED SWEEP BAR ================= */}
      <div className="w-full flex items-center justify-between border-b border-subtle/40 py-1.5 px-1 bg-surface/60 pointer-events-auto">
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted">
          <span className="text-accent font-bold">RPM TACH</span>
          <span>//</span>
          <span className="text-hud font-bold">{smoothRpm.toLocaleString()}</span>
          <span>/</span>
          <span>{MOTORCYCLE_CONFIG.specs.maxRpm.toLocaleString()}</span>
        </div>
        
        {/* 20 Segment High-Intensity LED Meter */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalSegments }).map((_, idx) => {
            const isLit = idx < litSegments;
            const isRedline = idx >= 16;
            const isAmber = idx >= 12 && idx < 16;
            const colorClass = isLit
              ? isRedline
                ? 'bg-accent shadow-sm shadow-accent animate-pulse'
                : isAmber
                ? 'bg-amber-400'
                : 'bg-hud'
              : 'bg-white/10';

            return (
              <div
                key={idx}
                className={`w-2.5 md:w-3.5 h-2 transition-all duration-75 ${colorClass}`}
                style={{
                  clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ================= HOVER READOUT BAR ================= */}
      {hoveredPart && (
        <div className="fixed left-8 bottom-28 bg-surface border border-accent px-4 py-2 pointer-events-auto z-30 font-mono text-xs flex items-center gap-3">
          <span className="w-2 h-2 bg-hud animate-ping"></span>
          <span className="text-muted uppercase">HOTSPOT TARGET:</span>
          <span className="text-text font-bold uppercase">{hoveredPart}</span>
          <span className="text-hud text-[10px]">[TELEMETRY LOCK]</span>
        </div>
      )}

      {/* ================= FOOTER TELEMETRY HUD ================= */}
      <footer className="border-t border-subtle pt-4 pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Live Gauges */}
        <div className="flex items-center gap-4 md:gap-6 font-mono text-xs">
          <div className="border border-blueprint px-3 py-1.5 bg-surface">
            <span className="text-muted mr-2">RPM</span>
            <span className="text-hud font-bold">{smoothRpm}</span>
          </div>

          <div className="border border-blueprint px-3 py-1.5 bg-surface">
            <span className="text-muted mr-2">SPEED</span>
            <span className="text-text font-bold">{smoothSpeed} <span className="text-muted text-[10px]">KM/H</span></span>
          </div>

          <div className="border border-blueprint px-3 py-1.5 bg-surface flex items-center gap-2">
            <span className="text-muted">GEAR</span>
            <span className="text-accent font-bold text-sm bg-accent/10 px-1.5 py-0.5 border border-accent/40">{gear}</span>
          </div>

          <div className="border border-blueprint px-3 py-1.5 bg-surface">
            <span className="text-muted mr-2">LEAN</span>
            <span className="text-text font-bold">{Math.abs(leanAngle).toFixed(1)}°</span>
          </div>

          <div className="hidden lg:flex border border-blueprint px-3 py-1.5 bg-surface">
            <span className="text-muted mr-2">SCROLL-VEL</span>
            <span className="text-hud font-bold">{Math.abs(scrollVelocity).toFixed(2)}</span>
          </div>

          {/* Interactive Throttle Button */}
          <button
            onMouseDown={() => setIsRevving(true)}
            onMouseUp={() => setIsRevving(false)}
            onTouchStart={() => setIsRevving(true)}
            onTouchEnd={() => setIsRevving(false)}
            className={`border px-3 py-1.5 transition-all flex items-center gap-2 ${
              isRevving
                ? 'bg-accent text-white font-bold border-accent shadow-md shadow-accent/40 animate-pulse'
                : 'bg-surface text-hud border-blueprint hover:border-accent'
            }`}
            title="Hold spacebar or mouse to rev engine"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            <span className="text-[10px]">{isRevving ? 'REV 10,500 RPM!' : 'HOLD TO REV [SPACE]'}</span>
          </button>
        </div>

        {/* Legal Disclaimer & Attribution */}
        <div className="font-mono text-[11px] text-muted text-center md:text-right">
          <div>{MOTORCYCLE_CONFIG.disclaimer}</div>
          <div className="text-[10px] text-muted/70">
            {MOTORCYCLE_CONFIG.name} concept • visual model: {MOTORCYCLE_CONFIG.visualModelName}
          </div>
          <div className="text-[10px] text-muted/70">
            <a href={MODEL_CREDIT.url} target="_blank" rel="noreferrer" className="underline pointer-events-auto">{MODEL_CREDIT.name} by {MODEL_CREDIT.author}</a> •{' '}
            <a href={MODEL_CREDIT.licenseUrl} target="_blank" rel="noreferrer" className="underline pointer-events-auto">CC BY-NC-SA 3.0 (noncommercial)</a>
          </div>
        </div>
      </footer>

      {/* ================= KEYBOARD SHORTCUTS MODAL ================= */}
      {showHotkeys && (
        <div
          onClick={() => setShowHotkeys(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full bg-surface border-2 border-accent p-6 shadow-2xl font-mono text-xs text-text"
          >
            <div className="flex items-center justify-between border-b border-subtle pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-hud inline-block" />
                <span className="font-anton text-lg tracking-wider text-text uppercase">FLIGHT DECK // KEY COMMANDS</span>
              </div>
              <button
                onClick={() => setShowHotkeys(false)}
                className="text-muted hover:text-accent font-bold px-2 py-0.5 border border-blueprint"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center justify-between border-b border-subtle/40 pb-1.5">
                <span className="text-muted">HOLD [SPACE]</span>
                <span className="text-accent font-bold">REV THROTTLE</span>
              </div>
              <div className="flex items-center justify-between border-b border-subtle/40 pb-1.5">
                <span className="text-muted">KEY [X]</span>
                <span className="text-cyan-400 font-bold">X-RAY BLUEPRINT</span>
              </div>
              <div className="flex items-center justify-between border-b border-subtle/40 pb-1.5">
                <span className="text-muted">KEY [C]</span>
                <span className="text-hud font-bold">CYCLE LIVERY</span>
              </div>
              <div className="flex items-center justify-between border-b border-subtle/40 pb-1.5">
                <span className="text-muted">KEY [I]</span>
                <span className="text-text font-bold">360° INSPECT</span>
              </div>
              <div className="flex items-center justify-between border-b border-subtle/40 pb-1.5">
                <span className="text-muted">KEYS [1 - 0]</span>
                <span className="text-hud font-bold">JUMP TO PART</span>
              </div>
              <div className="flex items-center justify-between border-b border-subtle/40 pb-1.5">
                <span className="text-muted">KEY [M]</span>
                <span className="text-text font-bold">MUTE AUDIO</span>
              </div>
              <div className="flex items-center justify-between border-b border-subtle/40 pb-1.5">
                <span className="text-muted">KEY [F]</span>
                <span className="text-text font-bold">FULLSCREEN</span>
              </div>
              <div className="flex items-center justify-between border-b border-subtle/40 pb-1.5">
                <span className="text-muted">SCROLL</span>
                <span className="text-hud font-bold">ANATOMY TRIP</span>
              </div>
            </div>

            <div className="text-[10px] text-muted text-center border-t border-subtle pt-3">
              CLICK ANYWHERE OUTSIDE OR PRESS ESC TO DISMISS
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
