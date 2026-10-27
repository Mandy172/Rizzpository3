import * as THREE from 'three';

/**
 * Creates a technical scan X-ray material with red emissive edge glow
 * and blueprint wireframe for the 'electronics' and 'frame' segments.
 * Built on MeshStandardMaterial to guarantee 100% compatibility with
 * Three.js WebGLRenderer uniforms and the postprocessing pipeline.
 */
export const createScanMaterial = (wireframe = false) => {
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x0e0e12),
    emissive: new THREE.Color(0xe10600),
    emissiveIntensity: 2.8,
    wireframe: wireframe,
    roughness: 0.1,
    metalness: 0.95,
    transparent: true,
    opacity: wireframe ? 0.95 : 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return mat;
};
