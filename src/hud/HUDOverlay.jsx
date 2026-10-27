import React from 'react';
import { useScrollStore } from '../store/scroll.js';
import { parts } from '../data/parts.js';

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

  const activePart = parts.find((p) => p.id === activePartId);

  // Dynamic telemetry math based on scroll progress
  const rpm = Math.round(1500 + progress * 11500);
  const speed = Math.round(progress * 305);
  const gear = progress < 0.1 ? 'N' : progress < 0.25 ? '1' : progress < 0.4 ? '2' : progress < 0.6 ? '3' : progress < 0.8 ? '4' : progress < 0.95 ? '5' : '6';
  const leanAngle = Math.sin(progress * Math.PI * 4) * 48;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 select-none">
      
      {/* ================= HEADER BAR ================= */}
      <header className="flex items-start justify-between border-b border-subtle pb-4 pointer-events-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-accent inline-block animate-pulse"></span>
            <span className="font-anton text-2xl tracking-wider text-text uppercase">
              APRILIA RSV4 // FACTORY 1100
            </span>
          </div>
          <span className="font-mono text-xs text-muted tracking-widest mt-1">
            ANATOMY TELEMETRY SYSTEM // REV.2026.4
          </span>
        </div>

        {/* Global HUD Quick Controls */}
        <div className="flex items-center gap-4">
          {/* Low Power Toggle */}
          <button
            onClick={() => setLowPower((prev) => !prev)}
            className={`font-mono text-xs px-3 py-1.5 border border-blueprint transition-colors ${
              lowPower ? 'bg-hud text-bg font-bold' : 'bg-surface text-text hover:border-accent'
            }`}
          >
            PWR: {lowPower ? 'LOW-RES' : 'ULTRA'}
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={() => setMuted((prev) => !prev)}
            className={`font-mono text-xs px-3 py-1.5 border border-blueprint transition-colors ${
              muted ? 'bg-surface text-muted' : 'bg-accent text-white font-bold'
            }`}
          >
            AUDIO: {muted ? 'MUTED' : 'LIVE'}
          </button>

          {/* Telemetry Stage Index */}
          <div className="border border-blueprint px-3 py-1 bg-surface font-mono text-xs text-hud">
            STAGE: {activePart ? `0${activePart.index + 1}/10` : progress > 0.8 ? 'COMPLETE' : 'STANDBY'}
          </div>
        </div>
      </header>

      {/* ================= DYNAMIC 3D LEADER LINE ================= */}
      {activePartScreenPos && activePart && (
        <svg className="fixed inset-0 pointer-events-none w-full h-full z-20 overflow-visible">
          {/* Pulsing Target Reticle at active part 3D coordinate */}
          <g transform={`translate(${activePartScreenPos.x}, ${activePartScreenPos.y})`}>
            <circle r="16" fill="none" stroke="#e10600" strokeWidth="1" strokeDasharray="4 2" />
            <circle r="4" fill="#e10600" />
            <line x1="-24" y1="0" x2="-8" y2="0" stroke="#e10600" strokeWidth="1" />
            <line x1="8" y1="0" x2="24" y2="0" stroke="#e10600" strokeWidth="1" />
            <line x1="0" y1="-24" x2="0" y2="-8" stroke="#e10600" strokeWidth="1" />
            <line x1="0" y1="8" x2="0" y2="24" stroke="#e10600" strokeWidth="1" />
          </g>

          {/* Hard angled technical leader line from crosshair to right-hand info panel */}
          <polyline
            points={`
              ${activePartScreenPos.x},${activePartScreenPos.y}
              ${activePartScreenPos.x + 60},${activePartScreenPos.y - 40}
              ${Math.max(activePartScreenPos.x + 120, window.innerWidth - 380)},${activePartScreenPos.y - 40}
            `}
            fill="none"
            stroke="#d4ff00"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          />
        </svg>
      )}

      {/* ================= ACTIVE PART TELEMETRY CARD (RIGHT SIDE) ================= */}
      {activePart && (
        <aside
          className="fixed right-8 top-1/2 -translate-y-1/2 w-80 bg-surface border border-blueprint p-5 pointer-events-auto z-30"
          style={{
            boxShadow: '0 0 20px rgba(0,0,0,0.8)',
          }}
        >
          <div className="flex items-center justify-between border-b border-subtle pb-2 mb-3">
            <span className="font-mono text-xs text-hud font-bold tracking-widest">
              COMPONENT IDENT // [0{activePart.index + 1}]
            </span>
            <span className="font-mono text-xs text-accent uppercase tracking-wider">
              INSPECTION
            </span>
          </div>

          <h2 className="font-anton text-2xl text-text tracking-wide uppercase mb-2">
            {activePart.name}
          </h2>

          <div className="space-y-2 my-4">
            <div className="flex justify-between border-b border-subtle/50 pb-1 font-mono text-xs">
              <span className="text-muted">SYSTEM ID:</span>
              <span className="text-text font-bold uppercase">{activePart.id}</span>
            </div>
            <div className="flex justify-between border-b border-subtle/50 pb-1 font-mono text-xs">
              <span className="text-muted">SPEC STATUS:</span>
              <span className="text-hud font-bold">RACE-READY</span>
            </div>
            <div className="flex justify-between border-b border-subtle/50 pb-1 font-mono text-xs">
              <span className="text-muted">CALIBRATION:</span>
              <span className="text-text font-bold">NOMINAL (±0.02mm)</span>
            </div>
          </div>

          {/* Part Overview */}
          <div className="bg-bg border border-blueprint p-3 font-mono text-xs text-muted leading-relaxed">
            <p className="text-text font-bold mb-1 text-[11px] uppercase tracking-wider text-accent">
              ENGINEERING NOTE:
            </p>
            {activePart.id === 'engine' && '65° V4 powerplant with inverted valve timing, churning 217 HP at 13,000 RPM.'}
            {activePart.id === 'frame' && 'Polished dual-beam perimeter frame with adjustable swingarm pivot and steering headstock.'}
            {activePart.id === 'front-fork' && 'Öhlins Smart EC 2.0 semi-active electronic suspension adapting to braking loads in real-time.'}
            {activePart.id === 'front-brakes' && 'Brembo Stylema monobloc 4-piston radial calipers clamping 330mm floating steel rotors.'}
            {activePart.id === 'electronics' && 'APRC 6-axis IMU managing traction, wheelie, launch, and engine brake controls.'}
            {activePart.id === 'winglets' && 'MotoGP-derived carbon downforce aerofoils generating 8kg load at 300 km/h.'}
            {activePart.id === 'exhaust' && 'Titanium 4-into-2-into-1 Akrapovič racing headers with carbon heat shielding.'}
            {activePart.id === 'swingarm-shock' && 'Under-slung inverted alloy swingarm linked to an Öhlins TTX36 gas-charged shock.'}
            {activePart.id === 'wheels' && 'Forged ultra-lightweight magnesium alloy wheels wrapped in Pirelli Supercorsa SP slicks.'}
            {activePart.id === 'cockpit' && 'High-contrast optical TFT digital telemetry instrument cluster with race shift lights.'}
          </div>
        </aside>
      )}

      {/* ================= HOVER READOUT BAR ================= */}
      {hoveredPart && (
        <div className="fixed left-8 bottom-28 bg-surface border border-accent px-4 py-2 pointer-events-auto z-30 font-mono text-xs flex items-center gap-3">
          <span className="w-2 h-2 bg-hud animate-ping"></span>
          <span className="text-muted uppercase">RAYCAST TARGET:</span>
          <span className="text-text font-bold uppercase">{hoveredPart}</span>
          <span className="text-hud text-[10px]">[CLICK TO INSPECT]</span>
        </div>
      )}

      {/* ================= FOOTER TELEMETRY HUD ================= */}
      <footer className="border-t border-subtle pt-4 pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Live Gauges */}
        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="border border-blueprint px-3 py-1.5 bg-surface">
            <span className="text-muted mr-2">RPM</span>
            <span className="text-hud font-bold">{rpm}</span>
          </div>

          <div className="border border-blueprint px-3 py-1.5 bg-surface">
            <span className="text-muted mr-2">SPEED</span>
            <span className="text-text font-bold">{speed} <span className="text-muted text-[10px]">KM/H</span></span>
          </div>

          <div className="border border-blueprint px-3 py-1.5 bg-surface">
            <span className="text-muted mr-2">GEAR</span>
            <span className="text-accent font-bold text-sm">{gear}</span>
          </div>

          <div className="border border-blueprint px-3 py-1.5 bg-surface">
            <span className="text-muted mr-2">LEAN</span>
            <span className="text-text font-bold">{Math.abs(leanAngle).toFixed(1)}°</span>
          </div>

          <div className="hidden lg:flex border border-blueprint px-3 py-1.5 bg-surface">
            <span className="text-muted mr-2">SCROLL-VEL</span>
            <span className="text-hud font-bold">{Math.abs(scrollVelocity).toFixed(2)}</span>
          </div>
        </div>

        {/* Legal Disclaimer & Attribution */}
        <div className="font-mono text-[11px] text-muted text-center md:text-right">
          <div>Unofficial fan project. Not affiliated with Aprilia.</div>
          <div className="text-[10px] text-muted/70">
            3D Model & Architecture by Sujay • Aprilia RSV4 Anatomy Hackathon
          </div>
        </div>
      </footer>
    </div>
  );
};
