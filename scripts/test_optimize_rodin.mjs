import { execSync } from 'child_process';
import fs from 'fs';

console.log('[Optimizer] Testing safe glTF-Transform optimization on Rodin model...');

// Step 1: Weld duplicate vertices
console.log('[Optimizer] Running weld...');
execSync('npx @gltf-transform/cli weld public/rodin-bike.glb /tmp/rodin-welded.glb', { stdio: 'inherit' });

// Step 2: Simplify with ratio 0.5 (750k triangles) preserving error tolerance
console.log('[Optimizer] Running simplify...');
execSync('npx @gltf-transform/cli simplify /tmp/rodin-welded.glb /tmp/rodin-simplified.glb --ratio 0.5 --error 0.001', { stdio: 'inherit' });

// Step 3: WebP texture compression (quality 92)
console.log('[Optimizer] Running webp texture compression...');
execSync('npx @gltf-transform/cli webp /tmp/rodin-simplified.glb public/models/rodin-bike-optimized.glb --quality 92', { stdio: 'inherit' });

const origSize = (fs.statSync('public/rodin-bike.glb').size / (1024 * 1024)).toFixed(2);
const optSize = (fs.statSync('public/models/rodin-bike-optimized.glb').size / (1024 * 1024)).toFixed(2);

console.log(`\nOriginal: ${origSize} MB`);
console.log(`Optimized: ${optSize} MB`);
