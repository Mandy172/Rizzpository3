import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollStore } from '../store/scroll.js';
import { parts } from '../data/parts.js';
import { partHotspots, getPartIdForMeshName } from './meshMap.js';
import { cameraKeyframes } from './cameraRig.js';
import { MOTORCYCLE_CONFIG } from '../data/motorcycleConfig.js';

// Power3.inOut easing function
function easePower3InOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Preset camera positions for 360° Inspection Mode
const INSPECTION_VIEWS = {
  default: { pos: [2.8, 1.4, 2.4], target: [0.0, 0.56, 0.0], fov: 40 },
  front: { pos: [3.30, 0.72, 0.0], target: [0.35, 0.58, 0.0], fov: 33 },
  side: { pos: [0.0, 0.65, 2.8], target: [0.0, 0.55, 0.0], fov: 38 },
  rear: { pos: [-2.8, 0.85, 0.0], target: [-0.60, 0.55, 0.0], fov: 36 },
  engine: { pos: [1.1, 0.65, 1.1], target: [0.05, 0.45, 0.0], fov: 30 },
  cockpit: { pos: [-0.15, 1.38, 0.28], target: [0.35, 0.92, 0.0], fov: 38 },
};

export const BikeModel = () => {
  // Zustand Store
  const useOptimizedModel = useScrollStore((s) => s.useOptimizedModel);
  const setProgress = useScrollStore((s) => s.setProgress);
  const setActivePartId = useScrollStore((s) => s.setActivePartId);
  const setHoveredPart = useScrollStore((s) => s.setHoveredPart);
  const setActivePartScreenPos = useScrollStore((s) => s.setActivePartScreenPos);
  const setModelReady = useScrollStore((s) => s.setModelReady);
  const activePartId = useScrollStore((s) => s.activePartId);
  const hoveredPart = useScrollStore((s) => s.hoveredPart);
  const progress = useScrollStore((s) => s.progress);
  const inspectionMode = useScrollStore((s) => s.inspectionMode);
  const inspectionView = useScrollStore((s) => s.inspectionView);

  // Load either the exact raw supplied Rodin GLB model or optimized variant
  const modelUrl = useOptimizedModel ? '/models/rodin-bike-optimized.glb' : '/rodin-bike.glb';
  const { scene } = useGLTF(modelUrl, true);
  const { camera, size: viewportSize } = useThree();

  const groupRef = useRef();
  const modelRootRef = useRef();
  const hotspotMeshRef = useRef();

  // Reusable vectors for zero-garbage 60 FPS performance
  const reusable = useMemo(() => ({
    tempCamPos: new THREE.Vector3(),
    tempTarget: new THREE.Vector3(),
    currentLookAt: new THREE.Vector3(0, 0.56, 0),
    screenVec: new THREE.Vector3(),
    hotspotWorldPos: new THREE.Vector3(),
    redEmissive: new THREE.Color('#e10600'),
    whiteEmissive: new THREE.Color('#ffffff'),
    defaultEmissive: new THREE.Color('#000000'),
  }), []);

  // 1. MODEL INITIALIZATION & MATERIAL RESTORATION
  useEffect(() => {
    if (!scene) return;

    // Preserve original materials and textures without destructive transparency
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          // Keep original base-color texture map
          const mat = child.material;
          mat.transparent = false;
          mat.opacity = 1.0;
          mat.depthWrite = true;
          mat.depthTest = true;

          // Provide subtle PBR specular response so studio lighting reveals curves
          if (mat.roughness !== undefined) mat.roughness = 0.44;
          if (mat.metalness !== undefined) mat.metalness = 0.28;
          if (mat.emissive) mat.emissive.set(0x000000);

          mat.needsUpdate = true;
        }
      }
    });

    console.log(`[RODIN 3D // ${MOTORCYCLE_CONFIG.name}] Model Integrated & Analyzed:`, {
      source: MOTORCYCLE_CONFIG.geometry.source,
      vertices: MOTORCYCLE_CONFIG.geometry.vertexCount.toLocaleString(),
      triangles: MOTORCYCLE_CONFIG.geometry.triangleCount.toLocaleString(),
      texture: MOTORCYCLE_CONFIG.geometry.textureResolution,
    });

    setModelReady(true);
  }, [scene, setModelReady]);

  // Pointer interactions on model
  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    if (!activePartId) {
      setHoveredPart('engine');
    }
  }, [activePartId, setHoveredPart]);

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    setHoveredPart(null);
  }, [setHoveredPart]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (window.__lenis && !inspectionMode) {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = Math.min(progress + 1 / 12, 1);
      window.__lenis.scrollTo(nextProgress * scrollMax);
    }
  }, [progress, inspectionMode]);

  // 2. FRAME ANIMATION & CAMERA INTERPOLATION
  useFrame((state) => {
    const curProgress = Math.max(0, Math.min(1, progress));
    const totalSegments = 12;
    const rawSegment = curProgress * totalSegments;
    const segIndex = Math.min(Math.floor(rawSegment), totalSegments - 1);
    const segT = rawSegment - segIndex;
    const easedT = easePower3InOut(segT);

    // Midpoint active part detection during scroll
    let currentActivePartId = null;
    if (!inspectionMode) {
      if (segIndex >= 1 && segIndex <= 10) {
        currentActivePartId = parts[segIndex - 1].id;
      }
      if (currentActivePartId !== activePartId) {
        setActivePartId(currentActivePartId);
      }
    } else {
      if (inspectionView === 'engine') currentActivePartId = 'engine';
      else if (inspectionView === 'cockpit') currentActivePartId = 'cockpit';
      else if (inspectionView === 'front') currentActivePartId = 'front-fork';
      else if (inspectionView === 'side') currentActivePartId = 'frame';
      else if (inspectionView === 'rear') currentActivePartId = 'exhaust';
    }

    // Determine target camera framing
    let targetCamPos = reusable.tempCamPos;
    let targetLookAt = reusable.tempTarget;
    let targetFov = 40;

    if (inspectionMode) {
      const viewCfg = INSPECTION_VIEWS[inspectionView] || INSPECTION_VIEWS.default;
      targetCamPos.set(viewCfg.pos[0], viewCfg.pos[1], viewCfg.pos[2]);
      targetLookAt.set(viewCfg.target[0], viewCfg.target[1], viewCfg.target[2]);
      targetFov = viewCfg.fov;
    } else {
      const kfCurrent = cameraKeyframes[segIndex] || cameraKeyframes[0];
      const kfNext = cameraKeyframes[Math.min(segIndex + 1, cameraKeyframes.length - 1)];

      targetCamPos.set(
        THREE.MathUtils.lerp(kfCurrent.position[0], kfNext.position[0], easedT),
        THREE.MathUtils.lerp(kfCurrent.position[1], kfNext.position[1], easedT),
        THREE.MathUtils.lerp(kfCurrent.position[2], kfNext.position[2], easedT)
      );

      targetLookAt.set(
        THREE.MathUtils.lerp(kfCurrent.target[0], kfNext.target[0], easedT),
        THREE.MathUtils.lerp(kfCurrent.target[1], kfNext.target[1], easedT),
        THREE.MathUtils.lerp(kfCurrent.target[2], kfNext.target[2], easedT)
      );

      targetFov = THREE.MathUtils.lerp(kfCurrent.fov, kfNext.fov, easedT);

      // Subtle atmospheric camera drift during intro hero stage
      if (segIndex === 0) {
        const driftSpeed = state.clock.elapsedTime * 0.25;
        targetCamPos.z += Math.sin(driftSpeed) * 0.05;
        targetCamPos.y += Math.cos(driftSpeed * 0.8) * 0.02;
      }
    }

    // Responsive FOV adjustment for portrait mobile screens
    if (viewportSize.width > 0 && viewportSize.height > 0) {
      const aspect = viewportSize.width / viewportSize.height;
      if (aspect < 1.0) {
        targetFov = Math.min(60, targetFov * (1 + (1 - aspect) * 0.38));
      }
    }

    // Smooth camera dolly and focal tracking
    camera.position.lerp(targetCamPos, 0.12);
    reusable.currentLookAt.lerp(targetLookAt, 0.12);
    camera.lookAt(reusable.currentLookAt);

    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.12);
      camera.updateProjectionMatrix();
    }

    // Dynamic 3D Telemetry Hotspot & Screen Leader-Line Projection (active during anatomy scroll, suppressed during 360° inspection)
    const showTelemetryHotspot = !inspectionMode && currentActivePartId && partHotspots[currentActivePartId];
    if (showTelemetryHotspot) {
      const hotspot = partHotspots[currentActivePartId];
      reusable.hotspotWorldPos.copy(hotspot);

      // Animate 3D targeting reticle ring
      if (hotspotMeshRef.current) {
        hotspotMeshRef.current.position.copy(hotspot);
        hotspotMeshRef.current.visible = true;
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4.5) * 0.15;
        hotspotMeshRef.current.scale.set(pulse, pulse, pulse);
        hotspotMeshRef.current.lookAt(camera.position);
      }

      // Project 3D world coordinate to 2D viewport pixels
      reusable.screenVec.copy(reusable.hotspotWorldPos).project(camera);

      // Verify the component is in front of the camera plane
      if (reusable.screenVec.z < 1) {
        const x = ((reusable.screenVec.x + 1) * viewportSize.width) / 2;
        const y = ((-reusable.screenVec.y + 1) * viewportSize.height) / 2;
        setActivePartScreenPos({ x, y });
      } else {
        setActivePartScreenPos(null);
      }
    } else {
      if (hotspotMeshRef.current) {
        hotspotMeshRef.current.visible = false;
      }
      setActivePartScreenPos(null);
    }
  });

  // Calculate model matrix offsets (target 2.08m real-world length)
  const modelScale = 2.08 / 1.1444; // 1.8175
  const offsetX = 0.104;
  const offsetZ = 0.067;

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* 3D Model Root: Aligned along +X forward (Math.PI / 2), centered at origin, grounded on Y=0 */}
      <group
        ref={modelRootRef}
        rotation={[0, Math.PI / 2, 0]}
        scale={[modelScale, modelScale, modelScale]}
        position={[offsetX, 0, offsetZ]}
      >
        <primitive object={scene} />
      </group>

      {/* 3D Telemetry Targeting Reticle Marker */}
      <group ref={hotspotMeshRef} visible={false}>
        {/* Outer targeting ring */}
        <mesh>
          <ringGeometry args={[0.07, 0.082, 32]} />
          <meshBasicMaterial color="#e10600" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
        {/* Inner pulsing bullseye */}
        <mesh>
          <circleGeometry args={[0.024, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
        {/* Crosshair accents */}
        <mesh position={[0.095, 0, 0]}>
          <planeGeometry args={[0.025, 0.005]} />
          <meshBasicMaterial color="#e10600" />
        </mesh>
        <mesh position={[-0.095, 0, 0]}>
          <planeGeometry args={[0.025, 0.005]} />
          <meshBasicMaterial color="#e10600" />
        </mesh>
        <mesh position={[0, 0.095, 0]}>
          <planeGeometry args={[0.005, 0.025]} />
          <meshBasicMaterial color="#e10600" />
        </mesh>
        <mesh position={[0, -0.095, 0]}>
          <planeGeometry args={[0.005, 0.025]} />
          <meshBasicMaterial color="#e10600" />
        </mesh>
      </group>
    </group>
  );
};

useGLTF.preload('/rodin-bike.glb');
useGLTF.preload('/models/rodin-bike-optimized.glb');
