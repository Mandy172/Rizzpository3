import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useStore, useActiveIndex, PARTS, pad, toPx } from './useAnatomy.js';

export default function InfoPanel() {
  const idx = useActiveIndex();
  const [shown, setShown] = useState(Math.max(idx, 0));
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const panel = useRef(null), path = useRef(null), node = useRef(null), drag = useRef(0);

  // wipe out -> swap -> wipe in
  useEffect(() => {
    if (idx < 0) { setOpen(false); return; }
    if (!open) { setShown(idx); const r = requestAnimationFrame(() => setOpen(true)); return () => cancelAnimationFrame(r); }
    if (idx !== shown) {
      setOpen(false);
      const t = setTimeout(() => { setShown(idx); setOpen(true); }, 520);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  // typewriter on spec values
  useEffect(() => {
    if (!open || !panel.current) return;
    const tws = [...panel.current.querySelectorAll('.spec dd')].map((el, i) => {
      const t = el.dataset.text, o = { n: 0 };
      return gsap.to(o, {
        n: t.length, duration: Math.min(0.9, t.length * 0.04), delay: 0.4 + i * 0.08, ease: 'none',
        onUpdate: () => { el.textContent = t.slice(0, Math.round(o.n)) + (o.n < t.length ? '█' : ''); },
        onComplete: () => { el.textContent = t; },
      });
    });
    return () => tws.forEach((t) => t.kill());
  }, [shown, open]);

  // leader line, every frame
  useEffect(() => {
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = toPx(useStore.getState().activePartScreenPos), el = panel.current, d = path.current, n = node.current;
      if (!p || !el || !open || !d) { if (d) d.style.visibility = n.style.visibility = 'hidden'; return; }
      const r = el.getBoundingClientRect(), mobile = innerWidth <= 720, left = shown % 2 === 0;
      const sx = mobile ? r.left + r.width / 2 : left ? r.right : r.left, sy = mobile ? r.top : r.top + 64;
      const bx = mobile ? sx : p.x + (left ? -48 : 48);
      d.setAttribute('d', mobile ? `M${sx} ${sy} V${p.y}  H${p.x}` : `M${sx} ${sy} H${bx} L${p.x} ${p.y}`);
      n.setAttribute('x', p.x - 4); n.setAttribute('y', p.y - 4);
      d.style.visibility = n.style.visibility = 'visible';
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [open, shown]);

  const part = PARTS[shown];
  if (!part) return null;
  const side = shown % 2 === 0 ? 'l' : 'r';

  return (
    <>
      <svg className="leader" aria-hidden="true"><path ref={path} /><rect ref={node} width="8" height="8" /></svg>
      <aside ref={panel} className={`panel panel--${side} ${open ? 'is-in' : ''} ${collapsed ? 'is-min' : ''}`}>
        <div
          className="panel__handle"
          onPointerDown={(e) => { drag.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); }}
          onPointerUp={(e) => { const d = e.clientY - drag.current; setCollapsed(d > 24 ? true : d < -24 ? false : !collapsed); }}
        ><i /></div>
        <span className="panel__ghost" aria-hidden="true">[{pad(shown + 1)}]</span>
        <div className="panel__body">
          <div className="panel__tag">PART [{pad(shown + 1)}/{pad(PARTS.length)}]</div>
          <h2 className="panel__name">{part.name}</h2>
          {part.pitch && <p className="panel__pitch">{part.pitch}</p>}
          <dl className="specs">
            {part.specs.map(([k, v], i) => (
              <div className="spec" key={`${shown}-${i}`}><dt>{k}</dt><i className="lead" /><dd data-text={v} /></div>
            ))}
          </dl>
          {part.why && <div className="why"><b>WHY IT MATTERS</b><p>{part.why}</p></div>}
        </div>
      </aside>
    </>
  );
}
