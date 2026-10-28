import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';

// Node.js polyfill
global.self = global;
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

async function inspectGLB(filePath) {
  console.log(`\n================ INSPECTING: ${filePath} ================`);
  const buf = fs.readFileSync(filePath);
  console.log(`File size: ${(buf.byteLength / (1024 * 1024)).toFixed(2)} MB`);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  const gltf = await new Promise((resolve, reject) => {
    loader.parse(buf.buffer, '', resolve, reject);
  });

  const scene = gltf.scene;
  console.log(`Animations count: ${gltf.animations.length}`);
  gltf.animations.forEach((a, i) => console.log(`  Anim ${i}: "${a.name}" duration=${a.duration}s tracks=${a.tracks.length}`));

  const bbox = new THREE.Box3().setFromObject(scene);
  const size = bbox.getSize(new THREE.Vector3());
  const center = bbox.getCenter(new THREE.Vector3());

  console.log('\n--- BOUNDING BOX & DIMENSIONS ---');
  console.log('Min:', bbox.min.toArray().map(v => v.toFixed(4)));
  console.log('Max:', bbox.max.toArray().map(v => v.toFixed(4)));
  console.log('Size (X, Y, Z):', size.toArray().map(v => v.toFixed(4)));
  console.log('Center (X, Y, Z):', center.toArray().map(v => v.toFixed(4)));

  let nodeCount = 0;
  let meshCount = 0;
  let totalVerts = 0;
  let totalTris = 0;
  const materialsSet = new Set();
  const texturesSet = new Set();
  const hierarchy = [];

  function traverseNode(node, depth = 0) {
    nodeCount++;
    const indent = '  '.repeat(depth);
    let info = `${indent}- [${node.type}] "${node.name}"`;

    if (node.isMesh) {
      meshCount++;
      const geom = node.geometry;
      const pos = geom.attributes.position;
      const verts = pos ? pos.count : 0;
      const index = geom.index;
      const tris = index ? index.count / 3 : verts / 3;
      totalVerts += verts;
      totalTris += tris;

      const m = node.material;
      let matInfo = 'none';
      if (Array.isArray(m)) {
        matInfo = m.map(mat => mat.name || 'unnamed').join(', ');
        m.forEach(mat => materialsSet.add(mat));
      } else if (m) {
        matInfo = `${m.name || 'unnamed'} (${m.type})`;
        materialsSet.add(m);
      }

      info += ` (Verts: ${verts}, Tris: ${tris}, Mat: ${matInfo})`;
    }
    hierarchy.push(info);

    for (const child of node.children) {
      traverseNode(child, depth + 1);
    }
  }

  traverseNode(scene);

  console.log('\n--- HIERARCHY & NODES ---');
  console.log(`Total Nodes: ${nodeCount}, Meshes: ${meshCount}`);
  console.log(`Total Vertices: ${totalVerts.toLocaleString()}`);
  console.log(`Total Triangles: ${Math.round(totalTris).toLocaleString()}`);

  console.log('\nFirst 50 nodes in hierarchy:');
  hierarchy.slice(0, 50).forEach(h => console.log(h));
  if (hierarchy.length > 50) {
    console.log(`... and ${hierarchy.length - 50} more nodes.`);
  }

  console.log('\n--- MATERIALS & TEXTURES ---');
  console.log(`Unique Materials: ${materialsSet.size}`);
  for (const mat of materialsSet) {
    console.log(`  Material "${mat.name}" (${mat.type}):`);
    console.log(`    Color: ${mat.color ? mat.color.getHexString() : 'N/A'}`);
    console.log(`    Roughness: ${mat.roughness}, Metalness: ${mat.metalness}`);
    console.log(`    Transparent: ${mat.transparent}, Opacity: ${mat.opacity}`);
    const maps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap'];
    const activeMaps = maps.filter(m => mat[m]);
    console.log(`    Active Maps: ${activeMaps.join(', ') || 'None'}`);
    activeMaps.forEach(m => {
      const tex = mat[m];
      if (tex && tex.image) {
        const img = tex.image;
        console.log(`      ${m}: ${img.width || '?'}x${img.height || '?'} format=${tex.format}`);
      }
    });
  }
}

inspectGLB('public/rodin-bike.glb').catch(console.error);
