import React from 'react';
import { Environment, Grid } from '@react-three/drei';
import { useScrollStore } from '../store/scroll.js';

/**
 * Premium Cinematic Studio Lighting Setup for Aprilia RS 457:
 * - High-contrast dark studio aesthetic
 * - Large soft key light illuminating fairing contours and paintwork
 * - Cool fill lighting to retain detail in dark graphite and engine shadows
 * - Signature Aprilia Racing Red rim kicker from rear-high
 * - Low under-chassis glow for exhaust and ground contact drama
 * - Reflective dark ground with laser telemetry blueprint grid
 * - HDRI environment reflections for metallic frame, forks, and rotor surfaces
 */
export const StudioScene = () => {
  const lowPower = useScrollStore((s) => s.lowPower);

  return (
    <>
      {/* Base ambient shadow fill - subtle so shadows aren't pitch black */}
      <ambientLight intensity={0.65} color="#161920" />

      {/* Main Soft Key Light (Front-Top-Right) */}
      <directionalLight
        position={[3.5, 5.0, 3.5]}
        intensity={3.8}
        color="#e6f0fa"
        castShadow={!lowPower}
        shadow-mapSize={lowPower ? [512, 512] : [2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={15}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2.5}
        shadow-bias={-0.0002}
      />

      {/* Cool Slate-Blue Fill Light (Front-Left) */}
      <directionalLight
        position={[-3.5, 3.0, 2.5]}
        intensity={1.4}
        color="#8ba3c7"
      />

      {/* Signature Aprilia Racing Red Razor Rim Light (Rear-Top-Center) */}
      <spotLight
        position={[0, 3.6, -3.8]}
        target-position={[0, 0.55, 0]}
        intensity={24}
        color="#e10600"
        angle={0.65}
        penumbra={0.4}
        castShadow={!lowPower}
        shadow-bias={-0.0001}
      />

      {/* Low Under-Chassis Kicker Light (Subtle red ground bounce under engine and exhaust) */}
      <pointLight
        position={[-0.3, 0.15, 0.0]}
        intensity={3.5}
        color="#e10600"
        distance={3.0}
      />

      {/* High-Gloss Dark Studio Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow={!lowPower}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#07080a"
          roughness={0.22}
          metalness={0.85}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Architectural Telemetry Blueprint Grid */}
      <Grid
        position={[0, 0.001, 0]}
        args={[24, 24]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#e10600"
        sectionSize={2.0}
        sectionThickness={1.0}
        sectionColor="#cad5e2"
        fadeDistance={18}
        fadeStrength={1.5}
        infiniteGrid
      />

      {/* Environment Map for Mechanical PBR Specular Highlights */}
      <Environment preset="city" environmentIntensity={0.42} />
    </>
  );
};
