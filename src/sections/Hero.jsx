import { useEffect, useRef } from 'react'
import { useStore } from '../store.js'
import '../styles/hero.css'

export default function Hero() {
  const modelReady  = useStore((s) => s.modelReady)
  const wrapRef     = useRef(null)
  const line1Ref    = useRef(null)
  const line2Ref    = useRef(null)
  const subRef      = useRef(null)
  const bottomRef   = useRef(null)
  const revealed    = useRef(false)

  useEffect(() => {
    if (!modelReady || revealed.current) return
    revealed.current = true

    // Use native CSS animation via class toggle (no GSAP dependency on import timing)
    const els = [line1Ref.current, line2Ref.current, subRef.current, bottomRef.current]
    els.forEach((el, i) => {
      if (!el) return
      el.style.transition = `transform 0.9s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s, opacity 0.9s ease ${i * 0.12}s`
      el.style.transform  = 'translateY(0)'
      el.style.opacity    = '1'
    })
  }, [modelReady])

  const style = (delay = 0) => ({
    transform: 'translateY(110%)',
    opacity: 0,
    willChange: 'transform, opacity',
    transitionDelay: `${delay}s`,
  })

  return (
    <section className="hero" aria-label="Hero">
      {/* Headline */}
      <div className="hero__headline">
        <span className="hero__line-mask">
          <span className="hero__word hero__word--solid" ref={line1Ref} style={style(0)}>
            APRILIA
          </span>
        </span>
        <span className="hero__line-mask">
          <span className="hero__word hero__word--outline" ref={line2Ref} style={style(0.1)}>
            RSV4
          </span>
        </span>
        <span className="hero__line-mask" style={{ marginTop: '16px' }}>
          <span className="hero__sub" ref={subRef} style={style(0.22)}>
            ANATOMY OF A SUPERBIKE
          </span>
        </span>
      </div>

      {/* Bottom row */}
      <div className="hero__bottom" ref={bottomRef} style={style(0.34)}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <span className="hero__scroll-label">SCROLL TO DISASSEMBLE</span>
          <div className="hero__arrow">
            <div className="hero__arrow-line" />
            <div className="hero__arrow-head" />
          </div>
        </div>
        <div className="hero__stats">
          <span className="hero__stat">217 HP</span>
          <span className="hero__stat">1,099 CC</span>
          <span className="hero__stat">V4</span>
        </div>
      </div>
    </section>
  )
}
