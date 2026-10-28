import * as THREE from 'three';

/**
 * Maps inspection stages to measured visible areas of the repaired CGC model.
 *
 * Coordinates are in the transformed model world-space (meters):
 *   +X: Front, -X: Rear, +Y: Up (ground = 0), ±Z: Left / Right
 */
export const partHotspots = {
  'engine': new THREE.Vector3(-0.02, 0.39, 0.0),
  'frame': new THREE.Vector3(-0.08, 0.58, 0.02),
  'front-fork': new THREE.Vector3(0.78, 0.48, 0.02),
  'front-brakes': new THREE.Vector3(0.73, 0.31, 0.14),
  'electronics': new THREE.Vector3(0.32, 0.84, 0.0),
  'winglets': new THREE.Vector3(0.88, 0.72, 0.0),
  'exhaust': new THREE.Vector3(-0.57, 0.46, 0.0),
  'swingarm-shock': new THREE.Vector3(-0.64, 0.55, 0.0),
  'wheels': new THREE.Vector3(0.73, 0.31, 0.0),
  'cockpit': new THREE.Vector3(0.43, 0.92, 0.0),
};

export const partPrefixes = {
  'engine': ['engine'],
  'frame': ['frame'],
  'front-fork': ['fork'],
  'front-brakes': ['brake', 'disc', 'rotor', 'caliper'],
  'electronics': ['electronics'],
  'winglets': ['fairing', 'windscreen', 'fuel_tank', 'bodywork'],
  'exhaust': ['exhaust', 'muffler'],
  'swingarm-shock': ['swingarm', 'shock'],
  'wheels': ['wheel', 'tire', 'rim'],
  'cockpit': ['cockpit', 'handlebar', 'grip', 'speedometer', 'tft', 'mirror'],
};

export function getPartIdForMeshName(name) {
  if (!name) return null;
  const lower = name.toLowerCase();
  for (const [partId, prefixes] of Object.entries(partPrefixes)) {
    for (const prefix of prefixes) {
      if (lower.includes(prefix)) {
        return partId;
      }
    }
  }
  return null;
}
