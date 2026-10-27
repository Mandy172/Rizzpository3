import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '../store.js'
import { parts } from '../data/parts.js'
import '../styles/infopanel.css'

function LeaderLine({ panelRef }) {
  const svgRef     = useRef(null)
  const pathRef    = useRef(null)
  const dotRef     = useRef(null)
  const rafRef     = useRef(null)
  const screenPos  = useStore((s) => s.activePartScreenPos)
  const activeId   = useStore((s) => s.activePartId)

  const draw = useCallback(() => {
    if (!svgRef.current || !pathRef.current || !panelRef.current || !activeId) return

    const svg  = svgRef.current
    const rect = panelRef.current.getBoundingClientRect()

    // Panel anchor: right-middle or left-middle depending on side
    const isRight = panelRef.current.classList.contains('info-panel--right')
    const panelX  = isRight ? rect.left : rect.right
    const panelY  = rect.top + rect.height / 2

    const bikeX = screenPos.x
    const bikeY = screenPos.y

    const midX = (panelX + bikeX) / 2

    pathRef.current.setAttribute('d', `M${panelX},${panelY} C${midX},${panelY} ${midX},${bikeY} ${bikeX},${bikeY}`)
    dotRef.current.setAttribute('cx', bikeX)
    dotRef.current.setAttribute('cy', bikeY)

    rafRef.current = requestAnimationFrame(draw)
  }, [screenPos, activeId, panelRef])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw])

  return (
    <svg ref={svgRef} className="leader-line-svg" aria-hidden="true">
      <path
        ref={pathRef}
        fill="none"
        stroke="#FF1E1E"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      <rect
        ref={dotRef}
        x={0} y={0}
        width="6" height="6"
        fill="#FF1E1E"
        transform="translate(-3,-3)"
      />
    </svg>
  )
}

export default function InfoPanel() {
  const activeId  = useStore((s) => s.activePartId)
  const panelRef  = useRef(null)
  const prevIdRef = useRef(null)

  const part  = parts.find((p) => p.id === activeId)
  const index = part ? parseInt(part.index, 10) : 0
  const isRight = index % 2 === 0

  // Clip-path wipe animation
  const animateIn = useCallback(() => {
    const el = panelRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.clipPath    = 'inset(0 100% 0 0)'
    // Force reflow
    void el.offsetWidth
    el.style.transition = 'clip-path 0.55s cubic-bezier(0.76,0,0.24,1)'
    el.style.clipPath    = 'inset(0 0% 0 0)'
  }, [])

  const animateOut = useCallback((cb) => {
    const el = panelRef.current
    if (!el) { cb(); return }
    el.style.transition = 'clip-path 0.3s cubic-bezier(0.76,0,0.24,1)'
    el.style.clipPath    = 'inset(0 0 0 100%)'
    setTimeout(cb, 320)
  }, [])

  useEffect(() => {
    if (activeId === prevIdRef.current) return

    if (prevIdRef.current && activeId) {
      animateOut(() => {
        prevIdRef.current = activeId
        animateIn()
      })
    } else if (activeId) {
      prevIdRef.current = activeId
      animateIn()
    } else {
      animateOut(() => { prevIdRef.current = null })
    }
  }, [activeId, animateIn, animateOut])

  if (!part) return null

  const sideClass = isRight ? 'info-panel--right' : 'info-panel--left'

  return (
    <>
      <LeaderLine panelRef={panelRef} />
      <div ref={panelRef} className={`info-panel ${sideClass}`} role="complementary" aria-label={part.name}>
        <div className="info-panel__card">
          {/* Ghost index */}
          <span className="info-panel__ghost-index" aria-hidden="true">[{part.index}]</span>

          {/* Tag */}
          <div className="info-panel__tag">
            <span className="index-tag">[{part.index}/10]</span>
          </div>

          {/* Name */}
          <h2 className="info-panel__name">{part.name}</h2>

          {/* Pitch */}
          <p className="info-panel__pitch">{part.pitch}</p>

          {/* Hazard divider */}
          <div className="hazard-stripe" style={{ margin: '0 -24px 16px', width: 'calc(100% + 48px)' }} />

          {/* Specs table */}
          <table className="info-panel__specs" aria-label="Specifications">
            <tbody>
              {part.specs.map(([label, value]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* WHY strip */}
          <div className="info-panel__why">
            <div className="info-panel__why-label">WHY IT MATTERS</div>
            <p className="info-panel__why-text">{part.whyItMatters}</p>
          </div>

          {/* Mobile drag handle */}
          <div className="drag-handle" aria-hidden="true" />
        </div>
      </div>
    </>
  )
}
