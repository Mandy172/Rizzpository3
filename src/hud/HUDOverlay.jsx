import React from 'react';
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

  const activePart = parts.find((p) => p.id === activePartId);

  // Dynamic telemetry math calibrated for Aprilia RS 457 (10,500 RPM max, 185 km/h top speed)
  const rpm = Math.round(MOTORCYCLE_CONFIG.specs.idleRpm + progress * (MOTORCYCLE_CONFIG.specs.maxRpm - MOTORCYCLE_CONFIG.specs.idleRpm));
  const speed = Math.round(progress * 185);
  const gear = progress < 0.08 ? 'N' : progress < 0.22 ? '1' : progress < 0.4 ? '2' : progress < 0.6 ? '3' : progress < 0.8 ? '4' : progress < 0.95 ? '5' : '6';
  const leanAngle = Math.sin(progress * Math.PI * 4) * 44;

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
          {/* 360° Inspection Mode Toggle */}
          <button
            onClick={toggleInspectionMode}
            className={`font-mono text-xs px-3 py-1.5 border transition-colors ${
              inspectionMode
                ? 'bg-accent text-white font-bold border-accent shadow-lg shadow-accent/20'
                : 'bg-surface text-text border-blueprint hover:border-accent'
            }`}
          >
            {inspectionMode ? '✦ 360° INSPECT ACTIVE' : 'INSPECT 360°'}
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
            <circle r="18" fill="none" stroke="#e10600" strokeWidth="1" strokeDasharray="4 2" />
            <circle r="4" fill="#e10600" />
            <line x1="-26" y1="0" x2="-8" y2="0" stroke="#e10600" strokeWidth="1" />
            <line x1="8" y1="0" x2="26" y2="0" stroke="#e10600" strokeWidth="1" />
            <line x1="0" y1="-26" x2="0" y2="-8" stroke="#e10600" strokeWidth="1" />
            <line x1="0" y1="8" x2="0" y2="26" stroke="#e10600" strokeWidth="1" />
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
            boxShadow: '0 0 24px rgba(0,0,0,0.85)',
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
              <span className="text-muted">POWER RATIO:</span>
              <span className="text-hud font-bold">0.27 HP/KG</span>
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
            {activePart.id === 'engine' && 'Liquid-cooled 457cc parallel twin with 270° crank, delivering 47.6 HP @ 9,400 RPM with A2 class-leading power-to-weight.'}
            {activePart.id === 'frame' && 'Dual-beam aluminium perimeter chassis integrating the forward-canted engine as a stressed structural member.'}
            {activePart.id === 'front-fork' && '41mm upside-down (USD) front forks with 120mm travel and preload adjustability.'}
            {activePart.id === 'front-brakes' && '320mm floating steel disc clamped by ByBre radial 4-piston caliper with Bosch dual-channel ABS.'}
            {activePart.id === 'electronics' && 'APRC electronic suite with Ride-by-Wire, 3 Riding Modes (Eco, Rain, Sport), and 3-level Traction Control.'}
            {activePart.id === 'winglets' && 'MotoGP-derived double front fairing with internal aerodynamic ducts to optimize airflow stability.'}
            {activePart.id === 'exhaust' && '2-into-1 low-slung underbelly silencer centralizing mass and projecting the 270° twin rumble.'}
            {activePart.id === 'swingarm-shock' && 'Asymmetric high-rigidity swingarm with progressive monoshock and 130mm wheel travel.'}
            {activePart.id === 'wheels' && '17-inch multi-spoke sport alloy rims wrapped in 110/70 and 150/60 sport radial tyres with Aprilia red rim tape.'}
            {activePart.id === 'cockpit' && '5-inch full-color TFT optical dashboard with illuminated handlebar switchgear and clip-ons.'}
          </div>
        </aside>
      )}

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
    </div>
  );
};
