import { MOTORCYCLE_CONFIG } from './motorcycleConfig.js';

/**
 * Aprilia RS 457 — Official Technical Telemetry Specifications
 * Sourced directly from official Aprilia RS 457 technical documentation:
 * https://www.aprilia.com/en_EN/models/rs-457/
 */

export const parts = [
  {
    id: "engine",
    index: "01",
    name: "457cc PARALLEL-TWIN ENGINE",
    pitch: "47.6 HP. 270° CRANKSHAFT. CLASS-LEADING POWER-TO-WEIGHT.",
    specs: [
      ["DISPLACEMENT", "457 cc"],
      ["PEAK POWER", "47.6 HP (35 kW) @ 9,400 rpm"],
      ["PEAK TORQUE", "43.5 Nm @ 6,700 rpm"],
      ["ARCHITECTURE", "Forward-canted Parallel Twin DOHC, 4V/cyl, 270° firing order"],
    ],
    why: "The parallel-twin with 270° crank produces V-twin character and punchy low-end torque, mounted as a stressed member to maximize chassis rigidity.",
    source: "https://www.aprilia.com/en_EN/models/rs-457/",
  },
  {
    id: "frame",
    index: "02",
    name: "DUAL-BEAM ALUMINIUM FRAME",
    pitch: "MOTOGP-DERIVED TWIN-SPAR ARCHITECTURE.",
    specs: [
      ["CONSTRUCTION", "Dual-beam aluminium perimeter"],
      ["STRESSED ELEMENT", "Engine block integrated as structural member"],
      ["WHEELBASE", "1,350 mm"],
      ["KERB WEIGHT", "175 kg (with 90% fuel)"],
    ],
    why: "Unique in its class: the twin-spar aluminum chassis bridges directly from the steering neck to swingarm pivot plates around the stressed engine block.",
    source: "https://www.aprilia.com/en_EN/models/rs-457/",
  },
  {
    id: "front-fork",
    index: "03",
    name: "41mm USD INVERTED FORK",
    pitch: "PRECISE FRONT-END TELEMETRY FEEDBACK.",
    specs: [
      ["FORK TYPE", "Upside-down (USD) telescopic"],
      ["STANCHION DIAMETER", "Ø 41 mm"],
      ["WHEEL TRAVEL", "120 mm"],
      ["ADJUSTABILITY", "Preload adjustable"],
    ],
    why: "Inverted 41mm fork legs provide high torsional stiffness under hard track braking, ensuring crisp steering turn-in.",
    source: "https://www.aprilia.com/en_EN/models/rs-457/",
  },
  {
    id: "front-brakes",
    index: "04",
    name: "BYBRE RADIAL 4-PISTON BRAKES",
    pitch: "320mm FLOATING ROTOR WITH RADIAL MOUNT.",
    specs: [
      ["DISC DIAMETER", "320 mm floating steel disc"],
      ["CALIPER", "ByBre radial-mount 4-piston monobloc"],
      ["HYDRAULICS", "Metal-braided brake hose"],
      ["ABS SYSTEM", "Dual-channel Bosch ABS with anti-rollover"],
    ],
    why: "Superbike-derived radial caliper mounting prevents flex, providing razor-sharp brake lever feel and progressive stopping power.",
    source: "https://www.aprilia.com/en_EN/models/rs-457/",
  },
  {
    id: "electronics",
    index: "05",
    name: "APRC RIDE-BY-WIRE SUITE",
    pitch: "MULTIPLE ENGINE MAPS & 3-LEVEL TRACTION CONTROL.",
    specs: [
      ["THROTTLE", "Electronic Ride-by-Wire (RbW)"],
      ["RIDING MODES", "Eco, Rain, Sport"],
      ["TRACTION CONTROL", "3-level ATC (switchable on-the-fly)"],
      ["INSTRUMENTATION", "5-inch full-color TFT display"],
    ],
    why: "Advanced APRC electronic rider aids let you fine-tune power delivery and rear-wheel slip for maximum acceleration in any weather.",
    source: "https://www.aprilia.com/en_EN/models/rs-457/",
  },
  {
    id: "winglets",
    index: "06",
    name: "AERODYNAMIC DOUBLE FAIRING",
    pitch: "MOTOGP-INSPIRED AIRFLOW MANAGEMENT.",
    specs: [
      ["DESIGN", "Double front fairing with internal air tunnels"],
      ["HEADLIGHTS", "Full LED with integrated DRL signature"],
      ["WINDSCREEN", "Aerodynamic race bubble"],
      ["DRAG REDUCTION", "Wind-tunnel sculpted airflow"],
    ],
    why: "The layered aerodynamic fairing channels high-speed airflow around the rider, increasing high-speed stability and heat evacuation.",
    source: "https://www.aprilia.com/en_EN/models/rs-457/",
  },
  {
    id: "exhaust",
    index: "07",
    name: "2-INTO-1 UNDERBELLY EXHAUST",
    pitch: "MASS CENTRALIZATION & THROATY 270° SOUNDTRACK.",
    specs: [
      ["LAYOUT", "2-into-1 underbelly silencer"],
      ["MATERIAL", "Stainless steel with heat shield"],
      ["MASS PLACEMENT", "Low-slung beneath crankcase"],
      ["SOUNDTRACK", "Distinctive uneven firing rumble"],
    ],
    why: "Tucking the silencer beneath the engine lowers the center of gravity and concentrates mass for lightning-fast direction changes.",
    source: "https://www.aprilia.com/en_EN/models/rs-457/",
  },
  {
    id: "swingarm-shock",
    index: "08",
    name: "ASYMMETRIC SWINGARM & MONOSHOCK",
    pitch: "PROGRESSIVE REAR TRACTION CONTROL.",
    specs: [
      ["SWINGARM", "High-rigidity asymmetric arm"],
      ["REAR SHOCK", "Monoshock on progressive linkage"],
      ["TRAVEL", "130 mm wheel travel"],
      ["ADJUSTABILITY", "Spring preload adjustable"],
    ],
    why: "The asymmetric swingarm clears the low-slung exhaust while maintaining flex balance for predictable rear tire edge-grip.",
    source: "https://www.aprilia.com/en_EN/models/rs-457/",
  },
  {
    id: "wheels",
    index: "09",
    name: "17-INCH SPORT ALLOY WHEELS",
    pitch: "LIGHTWEIGHT ROTATING MASS FOR RAPID AGILITY.",
    specs: [
      ["FRONT TYRE", "110/70 ZR 17"],
      ["REAR TYRE", "150/60 ZR 17"],
      ["RIMS", "Multi-spoke lightweight alloy"],
      ["BEAD ACCENT", "Aprilia Racing red rim tape"],
    ],
    why: "Low rotational inertia allows instant flickability in chicanes, paired with sport-compound rubber for deep lean angles.",
    source: "https://www.aprilia.com/en_EN/models/rs-457/",
  },
  {
    id: "cockpit",
    index: "10",
    name: "5-INCH TFT COCKPIT & CONTROLS",
    pitch: "FULL-COLOR RACE TELEMETRY INTERFACE.",
    specs: [
      ["DISPLAY", "5.0-inch color TFT optical dashboard"],
      ["CLIP-ONS", "Forged clip-on handlebars below top triple clamp"],
      ["CONTROLS", "Backlit ergonomic handlebar switchgear"],
      ["CONNECTIVITY", "Aprilia MIA smartphone telemetry ready"],
    ],
    why: "The high-resolution optical bonded TFT screen delivers crystal-clear tachometer, speed, gear position, and APRC telemetry data at a glance.",
    source: "https://www.aprilia.com/en_EN/models/rs-457/",
  },
];

export const PARTS = parts;
export const PART_IDS = parts.map((p) => p.id);
export default parts;
