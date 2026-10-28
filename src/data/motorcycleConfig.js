/**
 * Central Motorcycle Configuration: Aprilia RS 457 (MKT R1 Concept)
 * Verified against official Aprilia manufacturer specifications:
 * https://www.aprilia.com/en_EN/models/rs-457/
 *
 * Unofficial concept & fan anatomy experience. Not affiliated with Aprilia.
 */

export const MOTORCYCLE_CONFIG = {
  name: 'APRILIA RS 457',
  modelCode: 'RS-457 // FACTORY RACING',
  tagline: 'ANATOMY OF A PARALLEL-TWIN SUPERSPORT',
  disclaimer: 'Unofficial fan experience. 3D geometry generated via Rodin neural reconstruction.',
  
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

  // 3D Geometry Metadata
  geometry: {
    source: 'Rodin Neural 3D Surface Reconstruction',
    originalFormat: 'GLB 2.0 (Khronos Blender I/O)',
    rawFileSize: '59.55 MB',
    optimizedFileSize: '25.90 MB',
    vertexCount: 924754,
    triangleCount: 1499746,
    textureResolution: '4096 x 4096 PNG Baked Albedo UV map',
    isSingleMesh: true,
    hasAnimationClips: false,
    wheelSeparationSupported: false,
  },
};
