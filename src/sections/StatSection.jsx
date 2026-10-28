import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useInRange, STAGES } from './useAnatomy.js';
import { MOTORCYCLE_CONFIG } from '../data/motorcycleConfig.js';

const STATS = [
  { to: 48, suf: ' HP', label: 'PEAK POWER (35 kW A2 BENCHMARK)' },
  { to: 270, suf: '° CRANK', label: 'PARALLEL-TWIN 457cc ARCHITECTURE' },
  { to: 175, suf: ' KG', label: 'KERB WEIGHT (90% FUEL LOAD)' },
];

export default function StatSection() {
  const on = useInRange(STAGES.stats);
  const root = useRef(null);
  useEffect(() => {
    if (!on) return;
    const els = [...root.current.querySelectorAll('.stat__n b')];
    const tws = els.map((el, i) => {
      const o = { n: 0 };
      return gsap.to(o, { n: STATS[i].to, duration: 1.4, delay: 0.35 + i * 0.12, ease: 'power3.inOut', onUpdate: () => { el.textContent = Math.round(o.n); } });
    });
    return () => { tws.forEach((t) => t.kill()); els.forEach((e) => { e.textContent = '0'; }); };
  }, [on]);

  return (
    <section ref={root} className={`stats ${on ? 'is-on' : ''}`}>
      {STATS.map((s, i) => (
        <div className="stat" key={s.label}>
          <div className="stat__n"><b>0</b><span className="out">{s.suf}</span></div>
          <div className="stat__l">[0{i + 1}/03] {s.label}</div>
        </div>
      ))}
    </section>
  );
}
