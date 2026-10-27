/**
 * PartNavigator.jsx — Right-edge part list
 * Lists [01] ENGINE … [10] COCKPIT
 * Active part highlighted in red with bar
 * Hover shows pitch preview
 * Click scrolls to that part via Lenis
 */
import { useStore } from "../store/useStore.js";
import { PARTS } from "../data/parts.js";
import "./PartNavigator.css";

export default function PartNavigator({ lenisRef }) {
  const activePart = useStore((s) => s.activePart);

  const scrollTo = (index) => {
    if (!lenisRef?.current) return;
    // Each part section occupies (1/10) of total scrollable height
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const target = (index / 10) * totalHeight;
    lenisRef.current.scrollTo(target, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 3) });
  };

  return (
    <nav className="part-nav" aria-label="Part navigator">
      {PARTS.map((part, i) => {
        const isActive = i === activePart;
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
