import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollStore } from '../store/scroll.js';
import { parts } from '../data/parts.js';
import { meshMap, meshToPartMap, getPartIdForMeshName } from './meshMap.js';
import { cameraKeyframes } from './cameraRig.js';

// Power3.inOut easing function
function easePower3InOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Seeded pseudo-random generator
function seededRandom(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const x = Math.sin(hash++) * 10000;
  return x - Math.floor(x);
}

export const BikeModel = () => {
  const { scene } = useGLTF('/bike.glb', true);
  const { camera, size: viewportSize } = useThree();
  const groupRef = useRef();

  // Zustand Store
  const setProgress = useScrollStore((s) => s.setProgress);
  const setActivePartId = useScrollStore((s) => s.setActivePartId);
  const setHoveredPart = useScrollStore((s) => s.setHoveredPart);
  const setActivePartScreenPos = useScrollStore((s) => s.setActivePartScreenPos);
  const setModelReady = useScrollStore((s) => s.setModelReady);
  const activePartId = useScrollStore((s) => s.activePartId);
  const hoveredPart = useScrollStore((s) => s.hoveredPart);
  const progress = useScrollStore((s) => s.progress);

  // Pre-allocated reusable vectors for 60fps performance
  const reusable = useMemo(() => ({
    tempCamPos: new THREE.Vector3(),
    tempTarget: new THREE.Vector3(),
    currentLookAt: new THREE.Vector3(0, 0.65, 0),
    activeCenter: new THREE.Vector3(),
    screenVec: new THREE.Vector3(),
    box: new THREE.Box3(),
    redEmissive: new THREE.Color('#e10600'),
    whiteEmissive: new THREE.Color('#ffffff'),
    blackEmissive: new THREE.Color('#000000'),
  }), []);

  // Map of part ID -> Array of component nodes/groups
  const partNodesMap = useRef({});

  // 1. MODEL LOADING & TRAVERSAL
  useEffect(() => {
    if (!scene) return;

    const meshList = [];
    partNodesMap.current = {};

    // Center and scale bike to origin, ~2 units tall
    const bbox = new THREE.Box3().setFromObject(scene);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());

    const targetScale = 2.0 / (size.y || 1);
    scene.scale.setScalar(targetScale);

    // Re-adjust so wheels sit precisely on the floor
    const adjustedBox = new THREE.Box3().setFromObject(scene);
    scene.position.x = -center.x * targetScale;
    scene.position.y = -adjustedBox.min.y;
    scene.position.z = -center.z * targetScale;

    // Traverse and register meshes for console.table
    scene.traverse((child) => {
      if (child.isMesh) {
        meshList.push({
          MeshName: child.name,
          PartID: getPartIdForMeshName(child.name) || 'unmapped',
          Vertices: child.geometry.attributes.position ? child.geometry.attributes.position.count : 0,
        });

        // Ensure materials have emissive enabled
        if (child.material) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.emissive = new THREE.Color(0x000000);
          child.material.emissiveIntensity = 0;
          child.userData.runtimeMaterial = child.material;
        }
      }
    });

    console.log('[APRILIA RSV4 // ANATOMY] 3D Model Loaded & Analyzed:');
    console.table(meshList.slice(0, 45));

    // Register component nodes for explosion
    const registerComponentNode = (node) => {
      const partId = getPartIdForMeshName(node.name);
      if (!partId) return;

      if (!partNodesMap.current[partId]) {
        partNodesMap.current[partId] = [];
      }

      node.userData.partId = partId;
      node.userData.assembledPos = node.position.clone();
      node.userData.assembledRot = node.rotation.clone();
      node.userData.staggerIndex = partNodesMap.current[partId].length;

      // Seeded random rotational jitter for physical feel during explosion
      const r1 = (seededRandom(node.name + '_rx') - 0.5) * 0.35;
      const r2 = (seededRandom(node.name + '_ry') - 0.5) * 0.45;
      const r3 = (seededRandom(node.name + '_rz') - 0.5) * 0.3;
      node.userData.rotJitter = new THREE.Euler(r1, r2, r3);

      // Pre-compute exploded offset
      let explodeDir = new THREE.Vector3(0, 0, 0);
      const name = node.name.toLowerCase();

      if (partId === 'wheels') {
        if (name.includes('front')) {
          explodeDir.set(0.65, -0.15, 0.25);
        } else {
          explodeDir.set(-0.65, -0.15, 0.25);
        }
      } else if (partId === 'front-fork') {
        if (name.includes('left')) {
          explodeDir.set(0.55, 0.22, -0.22);
        } else if (name.includes('right')) {
          explodeDir.set(0.55, 0.22, 0.22);
        } else {
          explodeDir.set(0.6, 0.2, 0);
        }
      } else if (partId === 'front-brakes') {
        explodeDir.set(0.6, -0.1, name.includes('left') ? -0.25 : 0.25);
      } else if (partId === 'engine') {
        explodeDir.set(0.12, -0.32, 0);
      } else if (partId === 'frame') {
        explodeDir.set(-0.25, 0.48, 0);
      } else if (partId === 'electronics') {
        explodeDir.set(0, 0.45, 0);
      } else if (partId === 'winglets') {
        explodeDir.set(0.35, 0.2, name.includes('left') ? -0.45 : 0.45);
      } else if (partId === 'exhaust') {
        explodeDir.set(-0.65, -0.15, 0.45);
      } else if (partId === 'swingarm-shock') {
        explodeDir.set(-0.45, -0.3, 0);
      } else if (partId === 'cockpit') {
        explodeDir.set(0.45, 0.45, 0);
      }

      node.userData.explodedPos = node.userData.assembledPos.clone().add(explodeDir);
      partNodesMap.current[partId].push(node);
    };

    // Traverse direct children of ML_01_Cafe_Racer and winglets
    const ml = scene.getObjectByName('ML_01_Cafe_Racer');
    if (ml) {
      ml.children.forEach(registerComponentNode);
    }
    const wing = scene.getObjectByName('winglets');
    if (wing) {
      wing.children.forEach(registerComponentNode);
    }

    setModelReady(true);
  }, [scene, setModelReady]);

  // Pointer interactions
  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    let current = e.object;
    while (current && current !== scene) {
      const pId = getPartIdForMeshName(current.name);
      if (pId) {
        setHoveredPart(pId);
        return;
      }
      current = current.parent;
    }
  }, [scene, setHoveredPart]);

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    setHoveredPart(null);
  }, [setHoveredPart]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    let current = e.object;
    while (current && current !== scene) {
      const pId = getPartIdForMeshName(current.name);
      if (pId) {
        const partIdx = parts.findIndex((p) => p.id === pId);
        if (partIdx !== -1) {
          const targetSegment = partIdx + 1;
          const targetProgress = (targetSegment + 0.5) / 12;
          if (window.__lenis) {
            const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
            window.__lenis.scrollTo(targetProgress * scrollMax);
          }
        }
        return;
      }
      current = current.parent;
    }
  }, [scene]);

  // 3. ANIMATION & FRAME LOOP
  useFrame((state) => {
    const curProgress = Math.max(0, Math.min(1, progress));
    const totalSegments = 12;
    const rawSegment = curProgress * totalSegments;
    const segIndex = Math.min(Math.floor(rawSegment), totalSegments - 1);
    const segT = rawSegment - segIndex;
    const easedT = easePower3InOut(segT);

    // Midpoint active part detection
    let currentActivePartId = null;
    if (segIndex >= 1 && segIndex <= 10) {
      currentActivePartId = parts[segIndex - 1].id;
    }
    if (currentActivePartId !== activePartId) {
      setActivePartId(currentActivePartId);
    }

    // Camera keyframe interpolation
    const kfCurrent = cameraKeyframes[segIndex] || cameraKeyframes[0];
    const kfNext = cameraKeyframes[Math.min(segIndex + 1, cameraKeyframes.length - 1)];

    reusable.tempCamPos.set(
      THREE.MathUtils.lerp(kfCurrent.position[0], kfNext.position[0], easedT),
      THREE.MathUtils.lerp(kfCurrent.position[1], kfNext.position[1], easedT),
      THREE.MathUtils.lerp(kfCurrent.position[2], kfNext.position[2], easedT)
    );

    reusable.tempTarget.set(
      THREE.MathUtils.lerp(kfCurrent.target[0], kfNext.target[0], easedT),
      THREE.MathUtils.lerp(kfCurrent.target[1], kfNext.target[1], easedT),
      THREE.MathUtils.lerp(kfCurrent.target[2], kfNext.target[2], easedT)
    );

    const targetFov = THREE.MathUtils.lerp(kfCurrent.fov, kfNext.fov, easedT);

    // Subtle orbit during intro hero segment
    if (segIndex === 0) {
      const orbitSpeed = state.clock.elapsedTime * 0.35;
      reusable.tempCamPos.x += Math.sin(orbitSpeed) * 0.12;
      reusable.tempCamPos.z += Math.cos(orbitSpeed) * 0.12;
    }

    camera.position.lerp(reusable.tempCamPos, 0.14);
    reusable.currentLookAt.lerp(reusable.tempTarget, 0.14);
    camera.lookAt(reusable.currentLookAt);

    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.12);
      camera.updateProjectionMatrix();
    }

    // Explode system & Materials updating
    const isScanModeActive = currentActivePartId === 'electronics' || currentActivePartId === 'frame';

    parts.forEach((part, partIdx) => {
      const partSegment = partIdx + 1;
      const isCurrentPart = part.id === currentActivePartId;
      const isPartHovered = part.id === hoveredPart;
      const nodes = partNodesMap.current[part.id] || [];

      // Determine explode factor
      let partExplodeFactor = 0;
      if (segIndex === 0) {
        partExplodeFactor = 0;
      } else if (segIndex === 11) {
        partExplodeFactor = 1 - easedT;
      } else if (segIndex === partSegment) {
        partExplodeFactor = easedT;
      } else if (segIndex > partSegment) {
        partExplodeFactor = 1;
      } else {
        partExplodeFactor = 0;
      }

      nodes.forEach((node) => {
        // Sub-component staggered timing
        const stagger = (node.userData.staggerIndex || 0) * 0.06;
        const subT = Math.max(0, Math.min(1, (partExplodeFactor - stagger) / (1 - stagger + 0.0001)));
        const finalT = easePower3InOut(subT);

        // Position interpolation
        node.position.lerpVectors(node.userData.assembledPos, node.userData.explodedPos, finalT);

        // Rotation interpolation with physical seeded jitter
        node.rotation.set(
          node.userData.assembledRot.x + node.userData.rotJitter.x * finalT,
          node.userData.assembledRot.y + node.userData.rotJitter.y * finalT,
          node.userData.assembledRot.z + node.userData.rotJitter.z * finalT
        );

        // Traverse child meshes to update material state
        node.traverse((child) => {
          if (child.isMesh && child.material) {
            if (isCurrentPart) {
              if (isScanModeActive) {
                // Technical scan X-ray mode: red wireframe scan
                child.material.wireframe = true;
                child.material.opacity = 0.95;
                child.material.emissive.copy(reusable.redEmissive);
                child.material.emissiveIntensity = 2.6;
              } else {
                child.material.wireframe = false;
                child.material.opacity = 1.0;
                child.material.emissive.copy(reusable.redEmissive);
                child.material.emissiveIntensity = 1.8;
              }
            } else {
              child.material.wireframe = false;
              if (isPartHovered) {
                child.material.opacity = 0.95;
                child.material.emissive.copy(reusable.whiteEmissive);
                child.material.emissiveIntensity = 1.2;
              } else {
                const targetOpacity = currentActivePartId ? 0.22 : 1.0;
                child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity, 0.12);
                child.material.emissive.copy(reusable.blackEmissive);
                child.material.emissiveIntensity = 0;
              }
            }
          }
        });
      });
    });

    // Project active part center to screen pixels for leader lines
    if (currentActivePartId && partNodesMap.current[currentActivePartId]?.length > 0) {
      const activeNodes = partNodesMap.current[currentActivePartId];
      reusable.box.makeEmpty();
      activeNodes.forEach((n) => reusable.box.expandByObject(n));
      reusable.box.getCenter(reusable.activeCenter);

      reusable.screenVec.copy(reusable.activeCenter).project(camera);

      // Only emit if part is in front of camera
      if (reusable.screenVec.z < 1) {
        const x = ((reusable.screenVec.x + 1) * viewportSize.width) / 2;
        const y = ((-reusable.screenVec.y + 1) * viewportSize.height) / 2;
        setActivePartScreenPos({ x, y });
      } else {
        setActivePartScreenPos(null);
      }
    } else {
      setActivePartScreenPos(null);
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <primitive object={scene} />
    </group>
  );
};

useGLTF.preload('/bike.glb');
