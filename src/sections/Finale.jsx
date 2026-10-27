import { useInRange, STAGES } from './useAnatomy.js';

export default function Finale() {
  const on = useInRange(STAGES.finale);
  return (
    <section className={`fin ${on ? 'is-on' : ''}`}>
      <div className="hazard" aria-hidden="true" />
      <h2 className="fin__h">
        <span className="mask"><span style={{ '--d': '0s' }}>10 SYSTEMS.</span></span>{' '}
        <span className="mask"><span style={{ '--d': '.12s' }}>ONE MACHINE.</span></span>
      </h2>
      <a className="cta" href="https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/" target="_blank" rel="noreferrer">
        <span>VIEW THE FULL BIKE</span>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2 12h18M12 4l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" /></svg>
      </a>
      <footer className="fin__foot">
        <span>Unofficial fan project. Not affiliated with Aprilia.</span>
        <span>3D MODEL: Sujay &amp; Open Engineering Assets</span>
      </footer>
    </section>
  );
}
