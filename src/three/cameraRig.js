/**
 * Plain array of camera keyframes for GSAP scroll choreography.
 * Each entry defines { id, position: [x, y, z], target: [x, y, z], fov }.
 * Tuned for dramatic Awwwards-level cinematography and telemetry inspection.
 */
export const cameraKeyframes = [
  {
    id: 'intro',
    position: [3.2, 1.7, 2.8],
    target: [0, 0.65, 0],
    fov: 40,
  },
  {
    id: 'engine',
    position: [1.6, 0.9, 1.6],
    target: [0, 0.6, 0],
    fov: 34,
  },
  {
    id: 'frame',
    position: [-1.6, 1.6, 1.8],
    target: [-0.1, 0.85, 0],
    fov: 35,
  },
  {
    id: 'front-fork',
    position: [2.4, 1.1, 1.2],
    target: [0.95, 0.75, 0],
    fov: 32,
  },
  {
    id: 'front-brakes',
    position: [2.1, 0.55, 1.0],
    target: [1.15, 0.45, 0],
    fov: 28,
  },
  {
    id: 'electronics',
    position: [-0.3, 1.9, 1.5],
    target: [0, 0.85, 0],
    fov: 34,
  },
  {
    id: 'winglets',
    position: [1.8, 1.2, 1.4],
    target: [0.65, 0.85, 0],
    fov: 30,
  },
  {
    id: 'exhaust',
    position: [-1.9, 0.75, 1.6],
    target: [-0.8, 0.45, 0.2],
    fov: 32,
  },
  {
    id: 'swingarm-shock',
    position: [-1.7, 0.7, -1.4],
    target: [-0.65, 0.55, 0],
    fov: 32,
  },
  {
    id: 'wheels',
    position: [0.1, 0.75, 3.2],
    target: [0, 0.55, 0],
    fov: 38,
  },
  {
    id: 'cockpit',
    position: [0.65, 1.65, 0.5],
    target: [0.95, 1.15, 0],
    fov: 34,
  },
  {
    id: 'outro',
    position: [3.8, 2.0, 3.4],
    target: [0, 0.65, 0],
    fov: 44,
  },
];
