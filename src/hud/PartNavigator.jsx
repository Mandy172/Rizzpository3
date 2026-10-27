/**
 * PartNavigator.jsx — Right-edge part list
 * Lists [01] ENGINE … [10] COCKPIT
 * Active part highlighted in red with bar
 * Hover shows pitch preview
 * Click scrolls to that part via Lenis
 */
import { useScrollStore } from "../store/scroll.js";
import { PARTS } from "../data/parts.js";
import "./PartNavigator.css";

export default function PartNavigator({ lenisRef }) {
  const activePartId = useScrollStore((s) => s.activePartId);
  const activePart = useScrollStore((s) => s.activePart);

  const scrollTo = (index) => {
    const lenis = window.__lenis || lenisRef?.current;
    if (lenis) {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      // 12 segments total: segment 0 = Hero, segment 1..10 = parts 0..9
      const target = ((index + 1) / 12) * totalScroll;
      lenis.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 3) });
    }
  };

  return (
    <nav className="part-nav" aria-label="Part navigator">
      {PARTS.map((part, i) => {
        const isActive = part.id === activePartId || i === activePart;
        return (
          <button
            key={part.id}
            className={`part-nav__item ${isActive ? "part-nav__item--active" : ""}`}
            onClick={() => scrollTo(i)}
            aria-label={`Jump to ${part.name}`}
          >
            <div className="part-nav__bar" />
            <span className="part-nav__index">[{part.index}]</span>
            <span className="part-nav__name">{part.name}</span>
            <span className="part-nav__pitch">{part.pitch}</span>
          </button>
        );
      })}
    </nav>
  );
}
