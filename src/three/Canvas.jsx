import { Canvas } from "@react-three/fiber";

export default function ThreeCanvas() {
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
        gl={{ antialias: true }}
        style={{ width: "100%", height: "100%", background: "#000000" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
      </Canvas>
    </div>
  );
}
