/**
 * Preloader.jsx
 * Full-screen boot sequence for Aprilia RS 457 Telemetry System:
 *   1. Mono boot log types out line by line
 *   2. RPM arc sweeps to 10,500 redline
 *   3. Hard wipe → reveal when modelReady
 */
import { useEffect, useRef, useState } from "react";
import { useScrollStore } from "../store/scroll.js";
import { MOTORCYCLE_CONFIG } from "../data/motorcycleConfig.js";
import "./Preloader.css";

const BOOT_LINES = [
  "INIT RS 457 ECU...",
  "CHECKING BOSCH 6-AXIS SENSORS...",
  "LOADING RODIN 3D GEOMETRY...",
  "MOUNTING PARALLEL-TWIN 457cc ENGINE...",
  "CALIBRATING DUAL-BEAM CHASSIS...",
  "BINDING APRC RIDE-BY-WIRE...",
  "SYNC 5-INCH TFT TELEMETRY...",
  "SYSTEM READY.",
];

const REDLINE = MOTORCYCLE_CONFIG.specs.maxRpm; // 10,500 RPM
const ARC_RADIUS = 110;
const ARC_CENTER = 150;
const ARC_START_DEG = 135;
const ARC_SWEEP_DEG = 270;

function polarToXY(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const s = polarToXY(cx, cy, r, startDeg);
  const e = polarToXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export default function Preloader() {
  const modelReady = useScrollStore((s) => s.modelReady);
  const muted = useScrollStore((s) => s.muted);
  const toggleMuted = useScrollStore((s) => s.toggleMuted);

  const [lines, setLines] = useState([]);
  const [rpm, setRpm] = useState(0);
  const [done, setDone] = useState(false);
  const [wiping, setWiping] = useState(false);
  const audioRef = useRef(null);

  // Typewriter boot log
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 280);
    return () => clearInterval(interval);
  }, []);

  // RPM sweep animation
  useEffect(() => {
    let start = null;
    const duration = 2400;
    const raf = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setRpm(Math.round(eased * REDLINE));
      if (t < 1) requestAnimationFrame(raf);
    };
    const id = setTimeout(() => requestAnimationFrame(raf), 400);
    return () => clearTimeout(id);
  }, []);

  // Engine sound
  useEffect(() => {
    if (!muted && audioRef.current) {
      audioRef.current.volume = 0.35;
      audioRef.current.play().catch(() => {});
    } else if (muted && audioRef.current) {
      audioRef.current.pause();
    }
  }, [muted]);

  // Wipe when model ready, with fallback timer
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      useScrollStore.getState().setModelReady(true);
    }, 4500);
    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    if (modelReady) {
      setWiping(true);
      const t = setTimeout(() => setDone(true), 800);
      return () => clearTimeout(t);
    }
  }, [modelReady]);

  if (done) return null;

  const rpmFraction = rpm / REDLINE;
  const sweepEnd = ARC_START_DEG + ARC_SWEEP_DEG * rpmFraction;
  const redlineStart = ARC_START_DEG + ARC_SWEEP_DEG * 0.85;

  const trackPath = arcPath(ARC_CENTER, ARC_CENTER, ARC_RADIUS, ARC_START_DEG, ARC_START_DEG + ARC_SWEEP_DEG);
  const activePath = rpmFraction > 0 ? arcPath(ARC_CENTER, ARC_CENTER, ARC_RADIUS, ARC_START_DEG, sweepEnd) : "";

  return (
    <div className={`preloader ${wiping ? "is-wiping" : ""}`} role="dialog" aria-modal="true" aria-label="Loading experience">
      <audio ref={audioRef} src="/engine-start.wav" preload="auto" />

      {/* Grid texture overlay */}
      <div className="preloader__grid" aria-hidden="true" />

      {/* Top brand header */}
      <header className="preloader__head">
        <div className="preloader__logo">
          <span className="dot" />
          <span className="brand">{MOTORCYCLE_CONFIG.name}</span>
          <span className="tag">TELEMETRY // BOOT</span>
        </div>
        <button
          type="button"
          className="preloader__mute"
          onClick={toggleMuted}
          aria-label={muted ? "Unmute audio" : "Mute audio"}
        >
          [{muted ? "SOUND: OFF" : "SOUND: ON"}]
        </button>
      </header>

      {/* Center Tachometer Arc */}
      <div className="preloader__tach">
        <svg viewBox="0 0 300 300" className="tach-svg" aria-hidden="true">
          <path d={trackPath} className="tach-track" />
          {activePath && <path d={activePath} className="tach-active" />}
          <line
            x1={ARC_CENTER}
            y1={ARC_CENTER - ARC_RADIUS - 8}
            x2={ARC_CENTER}
            y2={ARC_CENTER - ARC_RADIUS + 4}
            className="tach-tick"
            transform={`rotate(${redlineStart - 90} ${ARC_CENTER} ${ARC_CENTER})`}
          />
        </svg>

        <div className="tach-readout">
          <div className="tach-val">{rpm.toLocaleString()}</div>
          <div className="tach-unit">RPM</div>
          <div className="tach-sub">RODIN 3D RECONSTRUCTION</div>
        </div>
      </div>

      {/* Terminal boot text */}
      <div className="preloader__log" aria-live="polite">
        {lines.map((line, idx) => (
          <div key={idx} className="preloader__line">
            <span className="prefix">&gt;</span> {line}
          </div>
        ))}
      </div>

      {/* Status footer */}
      <footer className="preloader__foot">
        <span className="status">STATUS: {modelReady ? "READY" : "LOADING ASSET..."}</span>
        <span className="hint">[PRESS ANY KEY TO SKIP]</span>
      </footer>
    </div>
  );
}
