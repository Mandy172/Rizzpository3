import { PARTS, pad, useActiveIndex } from './useAnatomy.js';
import { MOTORCYCLE_CONFIG } from '../data/motorcycleConfig.js';

export default function Frame() {
  const i = useActiveIndex();
  return (
    <>
      <div className="grid" aria-hidden="true">{Array.from({ length: 12 }, (_, k) => <i key={k} />)}</div>
      {['tl', 'tr', 'bl', 'br'].map((c) => <span key={c} className={`xh xh--${c}`} aria-hidden="true">+</span>)}
      <header className="bar">
        <span>RS 457 // ANATOMY</span>
        <span className="bar__mark">APRILIA</span>
        <span>[{pad(i < 0 ? 0 : i + 1)}/{pad(PARTS.length || 10)}]</span>
      </header>
      <div className="hazard hazard--top" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
