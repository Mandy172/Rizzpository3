import { useRef, useEffect } from 'react'
import { useStore } from '../store.js'
import '../styles/finale.css'

export default function Finale() {
  const scrollStage = useStore((s) => s.scrollStage)
  const visible     = scrollStage >= 9
  const headRef     = useRef(null)
  const revealed    = useRef(false)

  useEffect(() => {
    if (!visible || revealed.current) return
    revealed.current = true
    const el = headRef.current
    if (!el) return
    el.style.transition = 'transform 0.9s cubic-bezier(0.16,1,0.3,1), opacity 0.9s ease'
    el.style.transform  = 'translateY(0)'
    el.style.opacity    = '1'
  }, [visible])

  return (
    <div
      className="finale"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease', pointerEvents: visible ? 'auto' : 'none' }}
      aria-hidden={!visible}
    >
      <div
        ref={headRef}
        className="finale__headline"
        style={{ transform: 'translateY(60px)', opacity: 0 }}
      >
        10 SYSTEMS.<br />ONE MACHINE.
      </div>

      <button className="finale__cta" type="button" aria-label="View the full Aprilia RSV4">
        VIEW THE FULL BIKE
      </button>

      <div className="finale__footer">
        Unofficial fan project. Not affiliated with Aprilia.&nbsp;&nbsp;//&nbsp;&nbsp;
        3D Placeholder · RSV4 RF · 217 HP · 2024
      </div>
    </div>
  )
}
