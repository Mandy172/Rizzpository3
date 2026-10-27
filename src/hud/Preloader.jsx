/**
 * Preloader.jsx
 * Full-screen boot sequence:
 *   1. Mono boot log types out line by line
 *   2. RPM arc sweeps to 13,000 redline
 *   3. Hard wipe → reveal when modelReady
 */
import { useEffect, useRef, useState } from "react";
import { useStore } from "../store/useStore.js";
import "./Preloader.css";

const BOOT_LINES = [
  "INIT ECU...",
  "CHECKING SENSORS...",
  "LOADING FRAME.GLB",
  "CALIBRATING IMU...",
  "MOUNTING V4 ENGINE...",
  "BINDING APRC SUITE...",
  "SYNC 6-AXIS PLATFORM...",
  "SYSTEM READY.",
];

const REDLINE = 13000;
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
  const modelReady = useStore((s) => s.modelReady);
  const muted = useStore((s) => s.muted);
  const toggleMuted = useStore((s) => s.toggleMuted);

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
    }, 340);
    return () => clearInterval(interval);
  }, []);

  // RPM sweep animation
  useEffect(() => {
    let start = null;
    const duration = 2800;
    const raf = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setRpm(Math.round(eased * REDLINE));
      if (t < 1) requestAnimationFrame(raf);
    };
    const id = setTimeout(() => requestAnimationFrame(raf), 600);
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

  // Wipe when model ready
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
  const circumference = 2 * Math.PI * ARC_RADIUS;

  // Build SVG paths
  const trackPath = arcPath(ARC_CENTER, ARC_CENTER, ARC_RADIUS, ARC_START_DEG, ARC_START_DEG + ARC_SWEEP_DEG);
  const activePath = rpmFraction > 0
    ? arcPath(ARC_CENTER, ARC_CENTER, ARC_RADIUS, ARC_START_DEG, Math.min(sweepEnd, ARC_START_DEG + ARC_SWEEP_DEG))
    : null;
  const redlinePath = arcPath(ARC_CENTER, ARC_CENTER, ARC_RADIUS, redlineStart, ARC_START_DEG + ARC_SWEEP_DEG);
  const needlePos = polarToXY(ARC_CENTER, ARC_CENTER, ARC_RADIUS, Math.min(sweepEnd, ARC_START_DEG + ARC_SWEEP_DEG));

  const isRedline = rpm >= REDLINE * 0.85;

  return (
    <div className={`preloader ${wiping ? "preloader--wipe" : ""}`}>
      {/* Audio element — /public/engine-start.mp3 */}
      <audio ref={audioRef} src="/engine-start.wav" preload="auto" />

      {/* Mute toggle */}
      <button className="preloader__mute" onClick={toggleMuted} aria-label="Toggle sound">
        {muted ? "[ SOUND OFF ]" : "[ SOUND ON ]"}
      </button>

      {/* RPM gauge */}
      <div className="preloader__gauge">
        <svg viewBox={`0 0 ${ARC_CENTER * 2} ${ARC_CENTER * 2}`} width="300" height="300">
          {/* Track */}
          <path d={trackPath} fill="none" stroke="#1a1a1a" strokeWidth="8" strokeLinecap="round" />
          {/* Redline zone */}
          <path d={redlinePath} fill="none" stroke="#ff2200" strokeWidth="8" strokeLinecap="round" opacity="0.35" />
          {/* Active arc */}
          {activePath && (
            <path
              d={activePath}
              fill="none"
              stroke={isRedline ? "#ff2200" : "#d4ff00"}
              strokeWidth="8"
              strokeLinecap="round"
            />
          )}
          {/* Needle dot */}
          {rpmFraction > 0 && (
            <circle cx={needlePos.x} cy={needlePos.y} r="5" fill={isRedline ? "#ff2200" : "#d4ff00"} />
          )}
          {/* Center RPM readout */}
          <text
            x={ARC_CENTER}
            y={ARC_CENTER - 8}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isRedline ? "#ff2200" : "#d4ff00"}
            fontFamily="'JetBrains Mono', monospace"
            fontSize="26"
            fontWeight="700"
            letterSpacing="2"
          >
            {rpm.toLocaleString()}
          </text>
          <text
            x={ARC_CENTER}
            y={ARC_CENTER + 22}
            textAnchor="middle"
            fill="#555"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="10"
            letterSpacing="3"
          >
            RPM
          </text>
          {/* Redline label */}
          <text
            x={ARC_CENTER}
            y={ARC_CENTER + 48}
            textAnchor="middle"
            fill="#ff2200"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="9"
            letterSpacing="2"
          >
            REDLINE 13,000
          </text>
        </svg>
      </div>

      {/* Boot log */}
      <div className="preloader__log">
        {lines.map((l, i) => (
          <div key={i} className={`preloader__log-line ${i === lines.length - 1 ? "preloader__log-line--active" : ""}`}>
            <span className="preloader__prompt">&gt; </span>
            {l}
            {i === lines.length - 1 && <span className="preloader__cursor">_</span>}
          </div>
        ))}
      </div>

      {/* Model loading state */}
      {!modelReady && (
        <div className="preloader__status">AWAITING MODEL...</div>
      )}
    </div>
  );
}
