/**
 * Cinematic Camera Keyframes for Aprilia RS 457 Telemetry Scroll Choreography.
 * Tuned specifically for the Rodin 3D model geometry and scale:
 *   - Ground level at Y = 0.0
 *   - Model center at (0.0, 0.56, 0.0)
 *   - Total length = 2.08m
 */
export const cameraKeyframes = [
  {
    id: 'intro',
    position: [3.30, 0.72, 0.0],
    target: [0.35, 0.58, 0.0],
    fov: 33,
  },
  {
    id: 'engine',
    position: [1.3, 0.70, 1.3],
    target: [0.05, 0.45, 0.0],
    fov: 32,
  },
  {
    id: 'frame',
    position: [-1.4, 1.35, 1.5],
    target: [0.10, 0.70, 0.10],
    fov: 34,
  },
  {
    id: 'front-fork',
    position: [1.8, 0.95, 1.0],
    target: [0.62, 0.65, 0.05],
    fov: 32,
  },
  {
    id: 'front-brakes',
    position: [1.5, 0.42, 0.85],
    target: [0.72, 0.30, 0.12],
    fov: 28,
  },
  {
    id: 'electronics',
    position: [0.75, 1.45, 1.1],
    target: [0.48, 0.88, 0.0],
    fov: 34,
  },
  {
    id: 'winglets',
    position: [1.4, 0.95, 1.1],
    target: [0.60, 0.80, 0.22],
    fov: 30,
  },
  {
    id: 'exhaust',
    position: [-1.3, 0.55, 1.3],
    target: [-0.15, 0.26, 0.20],
    fov: 30,
  },
  {
    id: 'swingarm-shock',
    position: [-1.5, 0.65, -1.2],
    target: [-0.40, 0.42, 0.0],
    fov: 32,
  },
  {
    id: 'wheels',
    position: [0.0, 0.70, 2.5],
    target: [0.0, 0.45, 0.0],
    fov: 38,
  },
  {
    id: 'cockpit',
    position: [-0.15, 1.38, 0.28],
    target: [0.35, 0.92, 0.0],
    fov: 38,
  },
  {
    id: 'outro',
    position: [3.4, 1.8, 2.8],
    target: [0.0, 0.56, 0.0],
    fov: 42,
  },
];
