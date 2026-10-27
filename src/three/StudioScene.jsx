import React from 'react';
import { Environment, Grid } from '@react-three/drei';

/**
 * Dark brutalist studio scene:
 * - High-contrast reflective dark floor
 * - Razor-sharp red rim light from behind (#e10600)
 * - Cool key light (#c8dcf5)
 * - Laser floor telemetry grid with Aprilia Red and blueprint white
 * - Soft environment reflections
 */
export const StudioScene = () => {
  return (
    <>
      {/* Base ambient shadow fill */}
      <ambientLight intensity={0.4} color="#101216" />

      {/* Razor-sharp Red Rim Light from behind - Aprilia Racing signature */}
      <spotLight
        position={[0, 3.8, -4.2]}
        target-position={[0, 0.65, 0]}
        intensity={26}
        color="#e10600"
        angle={0.5}
        penumbra={0.3}
        castShadow
        shadow-bias={-0.0001}
      />

      {/* Low red under-kicker for ground reflection drama */}
      <pointLight position={[0, 0.1, -1.8]} intensity={8} color="#e10600" distance={5} />

      {/* Cool Key Light from front-top-right */}
      <directionalLight
        position={[4, 6, 4]}
        intensity={3.2}
        color="#c8dcf5"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0001}
      />

      {/* Cool blue-white fill light from left */}
      <directionalLight position={[-4, 3, 2]} intensity={0.9} color="#7a96b4" />

      {/* High-gloss dark studio floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color="#060608"
          roughness={0.18}
          metalness={0.9}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Architectural blueprint grid */}
      <Grid
        position={[0, 0.001, 0]}
        args={[30, 30]}
        cellSize={0.5}
        cellThickness={0.7}
        cellColor="#e10600"
        sectionSize={2.0}
        sectionThickness={1.2}
        sectionColor="#f2f2f0"
        fadeDistance={20}
        fadeStrength={1.6}
        infiniteGrid
      />

      {/* Soft environment map for mechanical specular reflections */}
      <Environment preset="city" environmentIntensity={0.35} />
    </>
  );
};
