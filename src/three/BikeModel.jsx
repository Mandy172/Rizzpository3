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
  default: { pos: [2.55, 1.25, 2.1], target: [0.0, 0.52, 0.0], fov: 36 },
  front: { pos: [1.8, 0.92, 1.55], target: [0.82, 0.68, 0.0], fov: 31 },
  side: { pos: [0.0, 0.76, 2.55], target: [0.0, 0.54, 0.0], fov: 38 },
  rear: { pos: [-1.8, 0.98, 1.55], target: [-0.78, 0.56, 0.0], fov: 32 },
  engine: { pos: [0.0, 0.36, 1.42], target: [-0.02, 0.4, 0.0], fov: 34 },
  cockpit: { pos: [0.95, 1.28, 1.25], target: [0.42, 0.91, 0.0], fov: 34 },
};

export const BikeModel = () => {
  // Zustand Store
  const setActivePartId = useScrollStore((s) => s.setActivePartId);
  const setHoveredPart = useScrollStore((s) => s.setHoveredPart);
  const setActivePartScreenPos = useScrollStore((s) => s.setActivePartScreenPos);
  const setModelReady = useScrollStore((s) => s.setModelReady);
  const activePartId = useScrollStore((s) => s.activePartId);
  const hoveredPart = useScrollStore((s) => s.hoveredPart);
  const progress = useScrollStore((s) => s.progress);
  const inspectionMode = useScrollStore((s) => s.inspectionMode);
  const inspectionView = useScrollStore((s) => s.inspectionView);

  // Use the same repaired asset in every power mode; low power only changes rendering cost.
  const { scene } = useGLTF(MOTORCYCLE_CONFIG.modelUrl);
  const { camera, size: viewportSize } = useThree();

  const groupRef = useRef();
  const modelRootRef = useRef();
  const hotspotMeshRef = useRef();
  const outerReticleRef = useRef();
  const innerReticleRef = useRef();
  const smoothedReticlePos = useRef(new THREE.Vector3(0.64, 0.54, 0.15));
  const meshPartMapRef = useRef(new Map());
  const originalMaterialsRef = useRef(new Map());

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

  // 1. MODEL INITIALIZATION, MESH MAPPING & MATERIAL RESTORATION
  useEffect(() => {
    if (!scene) return;

    meshPartMapRef.current.clear();
    originalMaterialsRef.current.clear();

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const partId = getPartIdForMeshName(child.name);
        if (partId) {
          meshPartMapRef.current.set(child, partId);
        }

        if (child.material && child.material.isMeshStandardMaterial) {
          const mat = child.material.clone();
          originalMaterialsRef.current.set(child, {
            origEmissive: mat.emissive ? mat.emissive.clone() : new THREE.Color(0, 0, 0),
            origEmissiveIntensity: mat.emissiveIntensity || 0,
          });
          child.material = mat;
        }
      }
    });

    wheelsRef.current = wheels;

    console.log(`[3D MODEL // ${MOTORCYCLE_CONFIG.visualModelName}] Loaded:`, {
      source: MOTORCYCLE_CONFIG.geometry.source,
      meshes: MOTORCYCLE_CONFIG.geometry.meshCount,
      mappedParts: meshPartMapRef.current.size,
      wheelsFound: wheels.length,
      primitives: MOTORCYCLE_CONFIG.geometry.primitiveCount,
      vertices: MOTORCYCLE_CONFIG.geometry.vertexCount.toLocaleString(),
      triangles: MOTORCYCLE_CONFIG.geometry.triangleCount.toLocaleString(),
      materials: MOTORCYCLE_CONFIG.geometry.materialCount,
      textures: MOTORCYCLE_CONFIG.geometry.textureResolution,
    });

    setModelReady(true);
  }, [scene, setModelReady]);

  // Pointer interactions on model
  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    if (!activePartId) {
      setHoveredPart(getPartIdForMeshName(e.object?.name));
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
  useFrame((state, delta) => {
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

      // Subtle atmospheric camera drift only during intro hero stage
      if (segIndex === 0) {
        const driftSpeed = state.clock.elapsedTime * 0.25;
        targetCamPos.z += Math.sin(driftSpeed) * 0.04;
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

    // Rock-solid smooth camera tracking (no gimbal fight, zero shake)
    camera.position.lerp(targetCamPos, 0.1);
    reusable.currentLookAt.lerp(targetLookAt, 0.1);
    camera.lookAt(reusable.currentLookAt);

    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.1);
      camera.updateProjectionMatrix();
    }

    // Active & Hovered Part Mesh Emissive Pulse
    const highlightTarget = hoveredPart || currentActivePartId;
    const pulseIntensity = 0.45 + Math.sin(state.clock.elapsedTime * 5.0) * 0.2;

    meshPartMapRef.current.forEach((pId, mesh) => {
      const orig = originalMaterialsRef.current.get(mesh);
      if (!orig || !mesh.material) return;

      const isTarget = pId === highlightTarget;
      if (isTarget) {
        mesh.material.emissive.lerp(reusable.redEmissive, 0.2);
        mesh.material.emissiveIntensity = THREE.MathUtils.lerp(
          mesh.material.emissiveIntensity,
          pulseIntensity,
          0.2
        );
      } else if (mesh.material.emissiveIntensity > 0.005) {
        mesh.material.emissive.lerp(orig.origEmissive, 0.12);
        mesh.material.emissiveIntensity = THREE.MathUtils.lerp(
          mesh.material.emissiveIntensity,
          orig.origEmissiveIntensity,
          0.12
        );
      }
    });

    // Dynamic 3D Telemetry Hotspot & Screen Leader-Line Projection
    const showTelemetryHotspot = !inspectionMode && currentActivePartId && partHotspots[currentActivePartId];
    if (showTelemetryHotspot) {
      const targetHotspot = partHotspots[currentActivePartId];
      // Smoothly glide 3D reticle to the component instead of snapping
      smoothedReticlePos.current.lerp(targetHotspot, 0.22);
      reusable.hotspotWorldPos.copy(smoothedReticlePos.current);

      // Animate 3D targeting reticle
      if (hotspotMeshRef.current) {
        hotspotMeshRef.current.position.copy(reusable.hotspotWorldPos);
        hotspotMeshRef.current.visible = true;
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4.5) * 0.08;
        hotspotMeshRef.current.scale.set(pulse, pulse, pulse);
        hotspotMeshRef.current.lookAt(camera.position);

        if (outerReticleRef.current) {
          outerReticleRef.current.rotation.z = state.clock.elapsedTime * 1.4;
        }
        if (innerReticleRef.current) {
          innerReticleRef.current.rotation.z = -state.clock.elapsedTime * 2.0;
        }
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

  const { scale: modelScale, position: modelPosition, rotation: modelRotation } = MOTORCYCLE_CONFIG.modelTransform;

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Measured GLB transform: +X forward, Y up, centered at the floor origin. */}
      <group
        ref={modelRootRef}
        rotation={modelRotation}
        scale={[modelScale, modelScale, modelScale]}
        position={modelPosition}
      >
        <primitive object={scene} />
      </group>

      {/* 3D Telemetry Targeting Reticle Marker (Depth-tested disabled to eliminate clipping on fork shockers/wheels) */}
      <group ref={hotspotMeshRef} visible={false} renderOrder={999}>
        {/* Rotating outer segmented targeting ring */}
        <mesh ref={outerReticleRef} renderOrder={999}>
          <ringGeometry args={[0.078, 0.090, 32]} />
          <meshBasicMaterial color="#e10600" transparent opacity={0.88} depthTest={false} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        {/* Counter-rotating secondary inner telemetry ring */}
        <mesh ref={innerReticleRef} renderOrder={999}>
          <ringGeometry args={[0.050, 0.056, 24]} />
          <meshBasicMaterial color="#d4ff00" transparent opacity={0.75} depthTest={false} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        {/* Inner pulsing bullseye */}
        <mesh renderOrder={999}>
          <circleGeometry args={[0.016, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.95} depthTest={false} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
        {/* Crosshair accents */}
        <mesh position={[0.10, 0, 0]} renderOrder={999}>
          <planeGeometry args={[0.024, 0.004]} />
          <meshBasicMaterial color="#e10600" depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[-0.10, 0, 0]} renderOrder={999}>
          <planeGeometry args={[0.024, 0.004]} />
          <meshBasicMaterial color="#e10600" depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.10, 0]} renderOrder={999}>
          <planeGeometry args={[0.004, 0.024]} />
          <meshBasicMaterial color="#e10600" depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.10, 0]} renderOrder={999}>
          <planeGeometry args={[0.004, 0.024]} />
          <meshBasicMaterial color="#e10600" depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
        {/* Holographic corner lock brackets */}
        <mesh position={[0.075, 0.075, 0]} renderOrder={999}>
          <planeGeometry args={[0.018, 0.003]} />
          <meshBasicMaterial color="#d4ff00" depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[-0.075, 0.075, 0]} renderOrder={999}>
          <planeGeometry args={[0.018, 0.003]} />
          <meshBasicMaterial color="#d4ff00" depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0.075, -0.075, 0]} renderOrder={999}>
          <planeGeometry args={[0.018, 0.003]} />
          <meshBasicMaterial color="#d4ff00" depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[-0.075, -0.075, 0]} renderOrder={999}>
          <planeGeometry args={[0.018, 0.003]} />
          <meshBasicMaterial color="#d4ff00" depthTest={false} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

useGLTF.preload(MOTORCYCLE_CONFIG.modelUrl);
