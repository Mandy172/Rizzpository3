import { useInRange, STAGES } from './useAnatomy.js';
import { MOTORCYCLE_CONFIG } from '../data/motorcycleConfig.js';
import { MODEL_CREDIT } from '../data/credits.js';

export default function Finale() {
  const on = useInRange(STAGES.finale);
  return (
    <section className={`fin ${on ? 'is-on' : ''}`}>
      <div className="hazard" aria-hidden="true" />
      <h2 className="fin__h">
        <span className="mask"><span style={{ '--d': '0s' }}>10 SYSTEMS.</span></span>{' '}
        <span className="mask"><span style={{ '--d': '.12s' }}>ONE MACHINE.</span></span>
      </h2>
      <a className="cta" href="https://www.aprilia.com/en_EN/models/rs-457/" target="_blank" rel="noreferrer">
        <span>VIEW RS 457 SPECIFICATIONS</span>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2 12h18M12 4l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" /></svg>
      </a>
      <footer className="fin__foot">
        <span>{MOTORCYCLE_CONFIG.disclaimer}</span>
        <span>
          <a href={MODEL_CREDIT.url} target="_blank" rel="noreferrer" className="underline pointer-events-auto">{MODEL_CREDIT.name} by {MODEL_CREDIT.author}</a>
          {' • '}
          <a href={MODEL_CREDIT.licenseUrl} target="_blank" rel="noreferrer" className="underline pointer-events-auto">CC BY-NC-SA 3.0 (noncommercial)</a>
          {' • '}{MOTORCYCLE_CONFIG.name} concept
        </span>
      </footer>
    </section>
  );
}
