/**
 * Maps each part ID from src/data/parts.js to the corresponding 3D mesh names
 * and component prefixes in public/bike.glb.
 */
export const partPrefixes = {
  'engine': [
    'crankcase',
    'cylinder-block',
    'cylinder-head',
    'gearbox',
    'carburetor',
    'air-filter',
    'case-bolt-1',
    'case-bolt-2',
    'case-bolt-3',
    'case-bolt-4',
    'case-bolt-5',
    'case-bolt-6',
    'case-bolt-7',
    'case-bolt-8',
  ],
  'frame': [
    'main-frame',
    'fuel-tank',
    'fuel-cap',
    'seat',
    'tail-cowl',
    'rear-fender',
    'left-footpeg',
    'right-footpeg',
  ],
  'front-fork': [
    'left-fork',
    'right-fork',
    'front-axle',
    'front-fender',
  ],
  'front-brakes': [
    'front-disc',
    'front-caliper',
    'brake-lever',
  ],
  'electronics': [
    'battery',
    'headlight',
    'tail-light',
    'left-indicator',
    'right-indicator',
  ],
  'winglets': [
    'winglet_left_upper',
    'winglet_left_lower',
    'winglet_right_upper',
    'winglet_right_lower',
    'winglets',
  ],
  'exhaust': [
    'exhaust-header',
    'silencer',
  ],
  'swingarm-shock': [
    'swingarm',
    'left-shock',
    'right-shock',
    'drive-chain',
    'rear-sprocket',
    'rear-axle',
    'rear-disc',
    'rear-caliper',
  ],
  'wheels': [
    'front-tire',
    'front-rim',
    'rear-tire',
    'rear-rim',
  ],
  'cockpit': [
    'handlebar',
    'left-grip',
    'right-grip',
    'clutch-lever',
    'left-mirror',
    'right-mirror',
    'speedometer',
  ],
};

/**
 * Returns the part ID for a given mesh or node name
 */
export function getPartIdForMeshName(name) {
  if (!name) return null;
  for (const [partId, prefixes] of Object.entries(partPrefixes)) {
    for (const prefix of prefixes) {
      if (name.startsWith(prefix) || name.includes(prefix)) {
        return partId;
      }
    }
  }
  return null;
}

export const meshMap = partPrefixes;
export const meshToPartMap = new Proxy({}, {
  get: (_, prop) => getPartIdForMeshName(prop),
});
