import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useStore, useInRange, STAGES } from './useAnatomy.js';

const Line = ({ children, out }) => (
  <span className="mask"><span className={out ? 'out' : undefined}>{children}</span></span>
);

export default function Hero() {
  const ready = useStore((s) => s.modelReady);
  const on = useInRange(STAGES.hero);
  const root = useRef(null);

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.mask > span', { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'power3.inOut', stagger: 0.12 });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section ref={root} className={`hero ${on ? 'is-on' : ''}`}>
      <div>
        <h1 className="hero__h"><Line>APRILIA</Line><Line out>RSV4</Line></h1>
        <p className="hero__sub"><Line>ANATOMY OF A SUPERBIKE</Line></p>
      </div>
      <div className="hero__bot">
        <div className="hero__scroll">
          <span className="out">SCROLL TO DISASSEMBLE</span>
          <svg className="arrow" viewBox="0 0 24 40" width="22" height="36" aria-hidden="true">
            <path d="M12 0v36M2 26l10 12 10-12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
          </svg>
        </div>
        <ul className="chips">
          <li className="chip"><b>217</b> HP</li>
          <li className="chip"><b>1,099</b> CC</li>
          <li className="chip"><b>V4</b></li>
        </ul>
      </div>
    </section>
  );
}
