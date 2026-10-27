import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store.js'
import '../styles/stats.css'

const STATS = [
  { value: 217,   suffix: ' HP',      label: 'PEAK POWER',   decimals: 0 },
  { value: 65,    suffix: '° V4',     label: 'ENGINE LAYOUT', decimals: 0 },
  { value: 6,     suffix: '-AXIS',    label: 'IMU SENSORS',  decimals: 0 },
]

function Counter({ to, suffix, decimals, trigger }) {
  const [display, setDisplay] = useState('000')
  const rafRef = useRef(null)

  useEffect(() => {
    if (!trigger) return
    const start    = performance.now()
    const duration = 1600
    const animate  = (now) => {
      const t   = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 4)
      const cur  = (ease * to).toFixed(decimals)
      setDisplay(cur)
      if (t < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [trigger, to, decimals])

  return <span>{display}{suffix}</span>
}

export default function StatSection() {
  const scrollStage = useStore((s) => s.scrollStage)
  // Show during electronics/engine stages (2-4)
  const visible = scrollStage >= 2 && scrollStage <= 4
  const [triggered, setTriggered] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (visible && !triggered) setTriggered(true)
    if (!visible) setTriggered(false)
  }, [visible])

  return (
    <div
      ref={ref}
      className="stat-section"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
        pointerEvents: 'none',
      }}
      aria-hidden={!visible}
    >
      <div className="stat-section__inner">
        {STATS.map((s) => (
          <div className="stat-item" key={s.label}>
            <div className="stat-item__value">
              <Counter to={s.value} suffix={s.suffix} decimals={s.decimals} trigger={triggered} />
            </div>
            <div className="stat-item__label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
