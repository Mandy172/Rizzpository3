import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';

// Node polyfill for FileReader
class FileReaderPolyfill {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf;
      if (this.onload) this.onload({ target: this });
      if (this.onloadend) this.onloadend({ target: this });
    });
  }
}
global.FileReader = FileReaderPolyfill;

async function buildModel() {
  console.log('[Model Builder] Loading intact mechanical base asset...');
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const buf = fs.readFileSync('/tmp/cafe-racer.glb');

  const gltf = await new Promise((resolve, reject) => {
    loader.parse(buf.buffer, '', resolve, reject);
  });

  const sourceScene = gltf.scene;

  // Race-spec Aprilia Factory materials
  const matApriliaRed = new THREE.MeshStandardMaterial({
    color: 0xe10600,
    roughness: 0.28,
    metalness: 0.35,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
  });
  const matCarbon = new THREE.MeshStandardMaterial({
    color: 0x121316,
    roughness: 0.55,
    metalness: 0.5,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
  });
  const matGoldOhlins = new THREE.MeshStandardMaterial({
    color: 0xc89d2d,
    roughness: 0.2,
    metalness: 0.95,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
  });
  const matBremboRed = new THREE.MeshStandardMaterial({
    color: 0xe10600,
    roughness: 0.3,
    metalness: 0.6,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
  });
  const matTitaniumExhaust = new THREE.MeshStandardMaterial({
    color: 0x5a6372,
    roughness: 0.25,
    metalness: 0.9,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
  });
  const matFrameAlloy = new THREE.MeshStandardMaterial({
    color: 0x24272c,
    roughness: 0.35,
    metalness: 0.88,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
  });
  const matEngineMetal = new THREE.MeshStandardMaterial({
    color: 0x181a1f,
    roughness: 0.45,
    metalness: 0.82,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
  });
  const matRubber = new THREE.MeshStandardMaterial({
    color: 0x141518,
    roughness: 0.85,
    metalness: 0.05,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
  });
  const matBrakeSteel = new THREE.MeshStandardMaterial({
    color: 0x9da3af,
    roughness: 0.25,
    metalness: 0.95,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
  });

  // Apply materials and name child meshes based on their parent part
  sourceScene.traverse((child) => {
    if (child.isMesh) {
      let p = child.parent;
      let partName = child.name;
      while (p && p !== sourceScene) {
        if (p.name && !p.name.startsWith('mesh_') && p.name !== 'ML_01_Cafe_Racer' && p.name !== 'AuxScene') {
          partName = p.name;
          break;
        }
        p = p.parent;
      }
      child.name = `${partName}_${child.name}`;

      // Style with Aprilia materials
      if (partName.includes('tire')) {
        child.material = matRubber;
      } else if (partName.includes('disc')) {
        child.material = matBrakeSteel;
      } else if (partName.includes('caliper')) {
        child.material = matBremboRed;
      } else if (partName.includes('fork') || partName.includes('shock')) {
        child.material = matGoldOhlins;
      } else if (partName.includes('exhaust') || partName.includes('silencer')) {
        child.material = matTitaniumExhaust;
      } else if (partName.includes('tank') || partName.includes('tail-cowl')) {
        child.material = matApriliaRed;
      } else if (partName.includes('frame') || partName.includes('swingarm')) {
        child.material = matFrameAlloy;
      } else if (partName.includes('crankcase') || partName.includes('cylinder') || partName.includes('gearbox')) {
        child.material = matEngineMetal;
      } else if (partName.includes('fender') || partName.includes('seat')) {
        child.material = matCarbon;
      } else {
        child.material = matFrameAlloy;
      }
    }
  });

  // Add signature Aprilia MotoGP carbon aerodynamic winglets
  const wingletGroup = new THREE.Group();
  wingletGroup.name = 'winglets';

  const wingGeom = new THREE.BoxGeometry(0.24, 0.018, 0.16);

  const wL1 = new THREE.Mesh(wingGeom, matCarbon);
  wL1.name = 'winglet_left_upper';
  wL1.position.set(0.65, 0.96, -0.36);
  wL1.rotation.set(0.1, -0.22, -0.16);
  wingletGroup.add(wL1);

  const wL2 = new THREE.Mesh(wingGeom, matCarbon);
  wL2.name = 'winglet_left_lower';
  wL2.position.set(0.62, 0.82, -0.32);
  wL2.rotation.set(0.1, -0.22, -0.16);
  wingletGroup.add(wL2);

  const wR1 = new THREE.Mesh(wingGeom, matCarbon);
  wR1.name = 'winglet_right_upper';
  wR1.position.set(0.65, 0.96, 0.36);
  wR1.rotation.set(0.1, 0.22, 0.16);
  wingletGroup.add(wR1);

  const wR2 = new THREE.Mesh(wingGeom, matCarbon);
  wR2.name = 'winglet_right_lower';
  wR2.position.set(0.62, 0.82, 0.32);
  wR2.rotation.set(0.1, 0.22, 0.16);
  wingletGroup.add(wR2);

  sourceScene.add(wingletGroup);

  console.log('[Model Builder] Exporting pristine assembled GLB to public/bike.glb...');
  const exporter = new GLTFExporter();
  const glbOutput = await exporter.parseAsync(sourceScene, { binary: true });

  fs.writeFileSync('public/bike.glb', Buffer.from(glbOutput));
  console.log(`[Model Builder] Success! Wrote public/bike.glb (${(fs.statSync('public/bike.glb').size / 1024).toFixed(1)} KB)`);
}

buildModel().catch((err) => {
  console.error('[Model Builder Error]', err);
  process.exit(1);
});
