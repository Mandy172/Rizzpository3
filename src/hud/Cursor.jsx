/**
 * Cursor.jsx — Custom crosshair + lagging ring cursor
 * - Over bike (hoveredPart set): expands + shows part name
 * - Over text: mix-blend-difference mode
 * - Touch devices: disabled
 */
import { useEffect, useRef, useState } from "react";
import { useScrollStore } from "../store/scroll.js";
import "./Cursor.css";

export default function Cursor() {
  const isTouch     = useScrollStore((s) => s.isTouch);
  const hoveredPart = useScrollStore((s) => s.hoveredPart);

  const cursorRef = useRef(null);
  const ringRef   = useRef(null);

  const pos    = useRef({ x: -200, y: -200 });
  const ringPos = useRef({ x: -200, y: -200 });
  const rafId  = useRef(null);

  const [overText, setOverText] = useState(false);

  useEffect(() => {
    if (isTouch) return;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
      // Detect text targets
      const el = document.elementFromPoint(e.clientX, e.clientY);
      setOverText(el && ["P", "H1", "H2", "H3", "SPAN", "A", "LI"].includes(el.tagName));
    };

    // Lagging ring via RAF lerp
    const lerp = (a, b, t) => a + (b - a) * t;
    const animate = () => {
      ringPos.current.x = lerp(ringPos.current.x, pos.current.x, 0.1);
      ringPos.current.y = lerp(ringPos.current.y, pos.current.y, 0.1);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, [isTouch]);

  if (isTouch) return null;

  const expanded = !!hoveredPart;

  return (
    <>
      {/* Crosshair dot */}
      <div
        ref={cursorRef}
        className={`cursor__dot ${overText ? "cursor__dot--text" : ""}`}
      />
      {/* Lagging ring */}
      <div
        ref={ringRef}
        className={`cursor__ring ${expanded ? "cursor__ring--expanded" : ""} ${overText ? "cursor__ring--text" : ""}`}
      >
        {expanded && hoveredPart && (
          <span className="cursor__label">{hoveredPart.toUpperCase()}</span>
        )}
      </div>
    </>
  );
}
