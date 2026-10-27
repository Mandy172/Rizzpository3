import { Canvas } from "@react-three/fiber";
import { useScrollStore } from "../store/scroll.js";
import { useStore } from "../store/useStore.js";
import { useEffect } from "react";

function PlaceholderBike() {
  const setHoveredPart = useScrollStore((s) => s.setHoveredPart);
  const setHoveredPartLegacy = useStore((s) => s.setHoveredPart);

  return (
    <group>
      <mesh
        position={[0, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredPart("engine");
          setHoveredPartLegacy("engine");
        }}
        onPointerOut={() => {
          setHoveredPart(null);
          setHoveredPartLegacy(null);
        }}
      >
        <boxGeometry args={[2.2, 0.9, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
}

export default function SceneCanvas({ onReady }) {
  const setModelReady = useScrollStore((s) => s.setModelReady);
  const setModelReadyLegacy = useStore((s) => s.setModelReady);

  useEffect(() => {
    setModelReady(true);
    setModelReadyLegacy(true);
    if (onReady) onReady();
  }, [onReady, setModelReady, setModelReadyLegacy]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "auto",
        backgroundColor: "#000000",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ width: "100%", height: "100%", background: "#000000" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} />
        <directionalLight position={[-5, -2, -3]} color="#ff2200" intensity={0.8} />
        <PlaceholderBike />
      </Canvas>
    </div>
  );
}
