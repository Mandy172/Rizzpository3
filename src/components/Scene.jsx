/**
 * Scene.jsx — R3F 3D scene
 * ──────────────────────────────────────────────────────────────────────────
 * Ownership: Sujay (3D/camera) + Manas (core wiring)
 * Kritagya wired the store contract — do not break it.
 *
 * HOW TO PLUG IN THE REAL GLB:
 *   1. Drop optimised rsv4.glb into /public/rsv4.glb
 *   2. Replace <BikeProxy> with <BikeModel url="/rsv4.glb" />
 *   3. Call onReady() inside BikeModel's useEffect once useGLTF resolves
 *   4. Wire mesh onPointerOver → setHoveredPart(mesh.name)
 *        mesh onPointerOut  → setHoveredPart(null)
 *
 * Store contract (read-only except where noted):
 *   READ  activePart, lowPower, hoveredPart
 *   WRITE setHoveredPart(name | null)   ← pointer events
 *   WRITE setModelReady(true)           ← once GLB loads
 * ──────────────────────────────────────────────────────────────────────────
 */
import { Suspense, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  Float,
  Preload,
  useGLTF,
  MeshReflectorMaterial,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useStore } from "../store/useStore.js";
import { PARTS } from "../data/parts.js";

// ── Camera rig: follows activePart ──────────────────────────────────────────
const CAMERA_POSITIONS = [
  // [x, y, z] per part — adjust to taste once real model is in
  [0,   1.2, 4.5],  // 01 engine   — front-right
  [2.5, 0.8, 3.0],  // 02 frame    — side
  [-2,  1.5, 3.5],  // 03 fork     — front-left
  [-2,  0.5, 2.5],  // 04 brakes   — close front-left
  [1.5, 2.0, 3.0],  // 05 elec     — high right
  [0,   2.5, 5.0],  // 06 winglets — wide front
  [2.5, 0.3, 2.0],  // 07 exhaust  — low right
  [2.0, 0.2, 2.5],  // 08 swingarm — rear-right
  [0,  -0.1, 3.5],  // 09 wheels   — ground level
  [0,   2.0, 3.5],  // 10 cockpit  — high front
];

const LOOK_AT = new THREE.Vector3(0, 0.4, 0);

function CameraRig() {
  const { camera } = useThree();
  const activePart = useStore((s) => s.activePart);
  const target = useRef(new THREE.Vector3());

  useEffect(() => {
    const [x, y, z] = CAMERA_POSITIONS[activePart] ?? [0, 1.2, 4.5];
    target.current.set(x, y, z);
  }, [activePart]);

  useFrame((_, delta) => {
    camera.position.lerp(target.current, delta * 1.8);
    camera.lookAt(LOOK_AT);
  });

  return null;
}

// ── Floor reflector ──────────────────────────────────────────────────────────
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <MeshReflectorMaterial
        blur={[400, 100]}
        resolution={512}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#050505"
        metalness={0.7}
      />
    </mesh>
  );
}

// ── Part highlight accent lines ───────────────────────────────────────────────
function PartAccents({ activePart }) {
  const part = PARTS[activePart];
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Scan line that sweeps up */}
      <mesh position={[0, Math.sin(Date.now() * 0.001) * 0.5, 0]}>
        <planeGeometry args={[3, 0.004]} />
        <meshBasicMaterial color="#d4ff00" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Bike proxy (procedural stand-in until real GLB is ready) ─────────────────
function BikeProxy({ onReady }) {
  const setHoveredPart = useStore((s) => s.setHoveredPart);
  const activePart     = useStore((s) => s.activePart);
  const groupRef       = useRef();

  // Fire onReady immediately (proxy loads instantly)
  useEffect(() => {
    const t = setTimeout(onReady, 800);
    return () => clearTimeout(t);
  }, [onReady]);

  // Slow idle float
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.08;
    }
  });

  // Accent colour for active part
  const accent = new THREE.Color("#d4ff00");
  const dim    = new THREE.Color("#1a1a1a");

  const parts = useMemo(() => [
    { name: "engine",        pos: [0, 0, 0],        size: [0.7, 0.5, 0.9] },
    { name: "frame",         pos: [0, 0.4, 0],      size: [0.2, 0.6, 1.4] },
    { name: "front-fork",    pos: [-0.05, 0, -0.75], size: [0.12, 0.8, 0.12] },
    { name: "front-brakes",  pos: [-0.25, -0.4, -0.8], size: [0.05, 0.3, 0.05] },
    { name: "electronics",   pos: [0, 0.75, -0.1],  size: [0.5, 0.15, 0.6] },
    { name: "winglets",      pos: [0, 0.3, -0.9],   size: [1.0, 0.08, 0.3] },
    { name: "exhaust",       pos: [0.3, -0.2, 0.5], size: [0.08, 0.08, 0.8] },
    { name: "swingarm-shock",pos: [0, -0.1, 0.7],   size: [0.15, 0.15, 0.6] },
    { name: "wheels",        pos: [0, -0.6, 0],     size: [0.08, 0.6, 0.6] },
    { name: "cockpit",       pos: [0, 0.9, -0.5],   size: [0.4, 0.2, 0.3] },
  ], []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {parts.map((p, i) => (
        <mesh
          key={p.name}
          position={p.pos}
          castShadow
          onPointerOver={(e) => { e.stopPropagation(); setHoveredPart(p.name); }}
          onPointerOut={() => setHoveredPart(null)}
        >
          <boxGeometry args={p.size} />
          <meshStandardMaterial
            color={i === activePart ? "#d4ff00" : "#0f0f0f"}
            emissive={i === activePart ? "#d4ff00" : "#000000"}
            emissiveIntensity={i === activePart ? 0.4 : 0}
            metalness={0.9}
            roughness={0.2}
            wireframe={i !== activePart}
          />
        </mesh>
      ))}
      {/* Bike silhouette core body */}
      <mesh position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.25, 1.4, 8, 16]} />
        <meshStandardMaterial
          color="#080808"
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

// ── Real GLB loader (uncomment once rsv4.glb is in /public/) ─────────────────
/*
function BikeModel({ url, onReady }) {
  const { scene, nodes } = useGLTF(url);
  const setHoveredPart = useStore((s) => s.setHoveredPart);
  const activePart = useStore((s) => s.activePart);
  const PART_MESH_MAP = {
    engine: "Engine_Mesh",      // Replace with actual node names from the GLB
    frame:  "Frame_Mesh",
    // ... etc
  };

  useEffect(() => { onReady(); }, []);

  return (
    <primitive
      object={scene}
      onPointerOver={(e) => {
        e.stopPropagation();
        const matched = Object.entries(PART_MESH_MAP)
          .find(([, meshName]) => e.object.name === meshName);
        if (matched) setHoveredPart(matched[0]);
      }}
      onPointerOut={() => setHoveredPart(null)}
    />
  );
}
*/

// ── Post-processing ───────────────────────────────────────────────────────────
function Effects({ lowPower }) {
  if (lowPower) return null;
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.6}
        luminanceSmoothing={0.9}
        intensity={0.6}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.3} darkness={0.8} />
    </EffectComposer>
  );
}

// ── Grid lines (racing telemetry feel) ───────────────────────────────────────
function GridLines() {
  return (
    <gridHelper
      args={[20, 40, "#111111", "#111111"]}
      position={[0, -0.84, 0]}
    />
  );
}

// ── Main Scene export ─────────────────────────────────────────────────────────
export default function Scene({ onReady }) {
  const lowPower   = useStore((s) => s.lowPower);
  const activePart = useStore((s) => s.activePart);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1 }}>
      <Canvas
        shadows
        dpr={lowPower ? [1, 1] : [1, 2]}
        camera={{ position: [0, 1.2, 4.5], fov: 45, near: 0.1, far: 100 }}
        gl={{
          antialias: !lowPower,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.05} />
        <directionalLight
          position={[5, 8, 3]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
          color="#ffffff"
        />
        <pointLight position={[-4, 3, -4]} intensity={0.4} color="#d4ff00" />
        <pointLight position={[4, 1, 4]}  intensity={0.2} color="#ff2200" />
        <spotLight
          position={[0, 6, 0]}
          angle={0.4}
          penumbra={0.8}
          intensity={0.6}
          castShadow
          color="#ffffff"
        />

        {/* Camera rig */}
        <CameraRig />

        {/* Environment (HDRI) — studio for metallic surfaces */}
        <Environment preset="studio" />

        {/* Scene elements */}
        <Suspense fallback={null}>
          {/* ↓ Swap BikeProxy for BikeModel once rsv4.glb is ready */}
          <Float speed={0.6} rotationIntensity={0.05} floatIntensity={0.08}>
            <BikeProxy onReady={onReady} />
          </Float>
        </Suspense>

        <Floor />
        <GridLines />
        <PartAccents activePart={activePart} />

        <ContactShadows
          position={[0, -0.84, 0]}
          opacity={0.7}
          scale={8}
          blur={2}
          far={4}
          color="#000000"
        />

        {/* Post-processing */}
        <Effects lowPower={lowPower} />

        <Preload all />
      </Canvas>
    </div>
  );
}

// Preload GLB (uncomment once file exists)
// useGLTF.preload("/rsv4.glb");
