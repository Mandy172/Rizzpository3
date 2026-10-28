import * as THREE from 'three';

/**
 * Maps each anatomy part ID from src/data/parts.js to its exact 3D coordinates
 * and telemetry anchor point on the Aprilia RS 457 Rodin model.
 *
 * Coordinates are in the transformed model world-space (meters):
 *   +X: Front
 *   -X: Rear
 *   +Y: Up (Ground = 0.0)
 *   ±Z: Left / Right
 */
export const partHotspots = {
  'engine': new THREE.Vector3(0.05, 0.45, 0.0),
  'frame': new THREE.Vector3(0.10, 0.72, 0.15),
  'front-fork': new THREE.Vector3(0.62, 0.65, 0.08),
  'front-brakes': new THREE.Vector3(0.72, 0.30, 0.12),
  'electronics': new THREE.Vector3(0.48, 0.88, 0.0),
  'winglets': new THREE.Vector3(0.60, 0.80, 0.28),
  'exhaust': new THREE.Vector3(-0.15, 0.26, 0.22),
  'swingarm-shock': new THREE.Vector3(-0.40, 0.42, 0.0),
  'wheels': new THREE.Vector3(0.72, 0.30, 0.0),
  'cockpit': new THREE.Vector3(0.32, 0.98, 0.0),
};

export const partPrefixes = {
  'engine': ['engine', 'crankcase', 'cylinder', 'gearbox', 'clutch'],
  'frame': ['frame', 'tank', 'seat', 'subframe', 'footpeg'],
  'front-fork': ['fork', 'stanchion', 'triple_clamp', 'fender'],
  'front-brakes': ['front-disc', 'front-caliper', 'brake-lever'],
  'electronics': ['electronics', 'battery', 'headlight', 'tail-light', 'drl'],
  'winglets': ['winglet', 'aero', 'fairing', 'duct'],
  'exhaust': ['exhaust', 'header', 'silencer', 'collector'],
  'swingarm-shock': ['swingarm', 'shock', 'chain', 'sprocket'],
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
