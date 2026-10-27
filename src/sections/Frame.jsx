import '../styles/frame.css'

export default function Frame() {
  return (
    <div className="frame" aria-hidden="true">
      {/* Top bar */}
      <div className="frame__topbar">
        <span className="frame__topbar-label">RSV4 // ANATOMY</span>
        <span className="frame__topbar-wordmark">APRILIA</span>
      </div>

      {/* 12-column grid */}
      <div className="frame__grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="frame__grid-col" />
        ))}
      </div>

      {/* Corner crosshairs */}
      <div className="frame__corner frame__corner--tl" />
      <div className="frame__corner frame__corner--tr" />
      <div className="frame__corner frame__corner--bl" />
      <div className="frame__corner frame__corner--br" />

      {/* Grain */}
      <div className="frame__grain" />
    </div>
  )
}
