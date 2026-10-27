/**
 * Scene.jsx — 3D scene stub
 * OWNED BY: Sujay + Manas
 * This file is a placeholder. Replace with the actual Three.js / R3F scene.
 *
 * Contract (read from store, never write except setHoveredPart):
 *   - Call onReady() once the GLB model is loaded
 *   - Write to useStore.setHoveredPart(name | null) on mesh pointer events
 *   - Read activePart, lowPower from the store to drive camera / highlight animation
 */
import { useEffect, useRef } from "react";
import { useStore } from "../store/useStore.js";

export default function Scene({ onReady }) {
  const lowPower = useStore((s) => s.lowPower);

  useEffect(() => {
    // TODO: Replace with real model load. For now, fire onReady after 2.5s stub delay.
    const t = setTimeout(() => onReady(), 2500);
    return () => clearTimeout(t);
  }, [onReady]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        background: lowPower
          ? "radial-gradient(ellipse at 60% 50%, #0a0a0a 0%, #000 100%)"
          : "radial-gradient(ellipse at 60% 50%, #0d0d0d 0%, #000 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 3D Canvas will be mounted here by Sujay/Manas */}
      <p
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          color: "#222",
        }}
      >
        [SCENE PLACEHOLDER — RSV4.GLB]
      </p>
    </div>
  );
}
