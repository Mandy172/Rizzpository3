/**
 * Cinematic keyframes fitted to the repaired CGC Motorcycle GLB.
 * Coordinates are in the normalized Three.js frame: +X front, Y up, Z lateral.
 * The model is 2.08m long and grounded at Y = 0.
 */
export const cameraKeyframes = [
  {
    id: 'intro',
    position: [2.55, 1.22, 2.05],
    target: [0.0, 0.52, 0.0],
    fov: 36,
  },
  {
    id: 'engine',
    position: [0.0, 0.36, 1.42],
    target: [-0.02, 0.4, 0.0],
    fov: 34,
  },
  {
    id: 'frame',
    position: [-0.18, 0.94, 1.28],
    target: [-0.08, 0.58, 0.02],
    fov: 32,
  },
  {
    id: 'front-fork',
    position: [1.12, 0.72, 0.98],
    target: [0.78, 0.48, 0.02],
    fov: 28,
  },
  {
    id: 'front-brakes',
    position: [1.02, 0.39, 0.92],
    target: [0.73, 0.31, 0.14],
    fov: 24,
  },
  {
    id: 'electronics',
    position: [0.86, 1.22, 1.18],
    target: [0.32, 0.84, 0.0],
    fov: 32,
  },
  {
    id: 'winglets',
    position: [1.38, 0.98, 1.15],
    target: [0.88, 0.72, 0.0],
    fov: 29,
  },
  {
    id: 'exhaust',
    position: [-0.15, 0.62, 1.28],
    target: [-0.57, 0.46, 0.0],
    fov: 28,
  },
  {
    id: 'swingarm-shock',
    position: [-0.98, 0.82, 1.08],
    target: [-0.64, 0.55, 0.0],
    fov: 30,
  },
  {
    id: 'wheels',
    position: [0.0, 0.68, 2.45],
    target: [0.0, 0.34, 0.0],
    fov: 38,
  },
  {
    id: 'cockpit',
    position: [0.92, 1.24, 1.02],
    target: [0.43, 0.92, 0.0],
    fov: 34,
  },
  {
    id: 'outro',
    position: [2.72, 1.72, 2.55],
    target: [0.0, 0.52, 0.0],
    fov: 43,
  },
];
