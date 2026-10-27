/**
 * HUD.jsx — Fixed heads-up display overlay
 * Corner brackets, scroll progress bar, live telemetry, mute toggle carry-over
 */
import { useStore } from "../store/useStore.js";
import "./HUD.css";

export default function HUD() {
  const rpm         = useStore((s) => s.rpm);
  const speed       = useStore((s) => s.speed);
  const gear        = useStore((s) => s.gear);
  const activePart  = useStore((s) => s.activePart);
  const scrollProgress = useStore((s) => s.scrollProgress);
  const muted       = useStore((s) => s.muted);
  const toggleMuted = useStore((s) => s.toggleMuted);

  const isRedline = rpm >= 13000 * 0.85;
  const rpmPct = (rpm / 13000) * 100;

  return (
    <div className="hud" aria-hidden="true">
      {/* ── Corner brackets ─────────────────────────────────────── */}
      <div className="hud__bracket hud__bracket--tl" />
      <div className="hud__bracket hud__bracket--tr" />
      <div className="hud__bracket hud__bracket--bl" />
      <div className="hud__bracket hud__bracket--br" />

      {/* ── Top-left telemetry block ────────────────────────────── */}
      <div className="hud__telem">
        {/* RPM bar + label */}
        <div className="hud__rpm-wrap">
          <span className="hud__label">RPM</span>
          <div className="hud__rpm-bar-track">
            <div
              className={`hud__rpm-bar-fill ${isRedline ? "hud__rpm-bar-fill--red" : ""}`}
              style={{ width: `${rpmPct}%` }}
            />
          </div>
          <span className={`hud__value hud__value--lg ${isRedline ? "hud__value--red" : ""}`}>
            {rpm.toLocaleString()}
          </span>
        </div>

        {/* Speed */}
        <div className="hud__row">
          <span className="hud__label">KM/H</span>
          <span className="hud__value hud__value--lg">{speed}</span>
        </div>

        {/* Gear */}
        <div className="hud__row">
          <span className="hud__label">GEAR</span>
          <span className="hud__value hud__value--xl">{gear}</span>
        </div>

        {/* Part index */}
        <div className="hud__row">
          <span className="hud__label">PART</span>
          <span className="hud__value">{String(activePart + 1).padStart(2, "0")}/10</span>
        </div>
      </div>

      {/* ── Scroll progress bar (left edge) ─────────────────────── */}
      <div className="hud__progress">
        <div className="hud__progress-track">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`hud__tick ${i <= activePart ? "hud__tick--active" : ""}`}
              style={{ top: `${(i / 9) * 100}%` }}
            />
          ))}
          <div
            className="hud__progress-fill"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>

      {/* ── Mute toggle (bottom-left) ────────────────────────────── */}
      <button className="hud__mute" onClick={toggleMuted} aria-label="Toggle mute">
        {muted ? "[ ♦ MUTED ]" : "[ ♪ LIVE ]"}
      </button>

      {/* ── Top-right: lap / session label ──────────────────────── */}
      <div className="hud__session">
        <span className="hud__label">SESSION</span>
        <span className="hud__value">RSV4-FACTORY</span>
      </div>
    </div>
  );
}
