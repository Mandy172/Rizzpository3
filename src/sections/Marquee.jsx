import { useStore } from '../store.js'
import '../styles/marquee.css'

const TEXT = 'BUILT TO BE TAKEN APART // RACE BRED // V4 // ANATOMIA ITALIANA // '
const REPEAT = 6

export default function Marquee() {
  const scrollStage = useStore((s) => s.scrollStage)
  // Show during winglets/exhaust stages (6-8)
  const visible = scrollStage >= 6 && scrollStage <= 8

  return (
    <div
      className="marquee-section"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
      aria-hidden={!visible}
    >
      {/* Filled strip - left */}
      <div className="marquee-track marquee-track--filled">
        <div className="marquee-inner marquee-inner--filled">
          {Array.from({ length: REPEAT }).map((_, i) => (
            <span key={i} className="marquee-item">{TEXT}</span>
          ))}
          {Array.from({ length: REPEAT }).map((_, i) => (
            <span key={`b${i}`} className="marquee-item">{TEXT}</span>
          ))}
        </div>
      </div>

      {/* Outlined strip - right */}
      <div className="marquee-track marquee-track--outlined">
        <div className="marquee-inner marquee-inner--outlined">
          {Array.from({ length: REPEAT }).map((_, i) => (
            <span key={i} className="marquee-item">{TEXT}</span>
          ))}
          {Array.from({ length: REPEAT }).map((_, i) => (
            <span key={`b${i}`} className="marquee-item">{TEXT}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
