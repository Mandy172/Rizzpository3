/**
 * Central configuration for the RS 457 concept experience and its CGC visual model.
 * Verified against official Aprilia manufacturer specifications:
 * https://www.aprilia.com/en_EN/models/rs-457/
 *
 * Unofficial concept experience. The CGC asset is a visual reference, not an Aprilia model.
 */

export const MOTORCYCLE_CONFIG = {
  name: 'APRILIA RS 457',
  modelCode: 'RS-457 // FACTORY RACING',
  visualModelName: 'CGC Motorcycle (Scythe)',
  tagline: 'RS 457 TECHNICAL CONCEPT // CGC SCYTHE VISUAL MODEL',
  disclaimer: 'Unofficial RS 457 concept experience. The 3D visual model is CGC Motorcycle (Scythe) by KuhnIndustries; its geometry does not verify RS 457 specifications or internal engine parts.',
  modelUrl: '/models/cgc-motorcycle.glb',
  modelTransform: {
    // GLB bounds measured in Three.js coordinates: X forward, Y up, Z lateral.
    scale: 0.2956431019,
    position: [0.3469711791, -0.1581690595, 0.5998879399],
    rotation: [0, 0, 0],
  },
  
  // Official RS 457 Performance Specifications
  specs: {
    displacement: '457 CC',
    power: '47.6 HP (35 kW)',
    powerRpm: '@ 9,400 RPM',
    torque: '43.5 NM',
    torqueRpm: '@ 6,700 RPM',
    architecture: 'Liquid-cooled 4-stroke Parallel Twin, DOHC 4-valve per cylinder, 270° crank',
    dryWeight: '159 KG',
    kerbWeight: '175 KG',
    topSpeed: '~185 KM/H',
    maxRpm: 10500,
    idleRpm: 1400,
    wheelbase: '1,350 MM',
    seatHeight: '800 MM',
    fuelTank: '13 LITRES',
    chassis: 'Dual-beam aluminium perimeter frame with engine as stressed member',
    frontSuspension: '41mm USD Inverted Fork, preload adjustable, 120mm travel',
    rearSuspension: 'Steel swingarm with preload adjustable monoshock, 130mm travel',
    frontBrakes: '320mm floating disc, ByBre radial-mount 4-piston caliper, braided steel line',
    rearBrakes: '220mm disc, ByBre single-piston floating caliper, Bosch 2-channel ABS',
    wheels: '17" sport alloy, 110/70 ZR17 (Front), 150/60 ZR17 (Rear)',
    electronics: 'Ride-by-Wire, 3 Riding Modes (Eco, Rain, Sport), 3-level ATC Traction Control, 5" TFT',
  },

  // Verified geometry metadata for the repaired CGC Motorcycle Phase 1 GLB.
  geometry: {
    source: 'CGC Motorcycle (Scythe), by KuhnIndustries',
    originalFormat: 'GLB 2.0 (Khronos Blender I/O)',
    fileSizeBytes: 11065080,
    meshCount: 18,
    primitiveCount: 41,
    materialCount: 14,
    vertexCount: 338741,
    triangleCount: 428688,
    textureResolution: 'No image textures; 14 glTF PBR materials',
    boundsMeters: {
      length: 2.08,
      height: 1.09115,
      width: 0.68277,
    },
    isSingleMesh: false,
    hasAnimationClips: false,
    wheelSeparationSupported: true,
  },
};
