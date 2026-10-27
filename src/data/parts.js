/**
 * Aprilia RSV4 Factory 2024 — Part Data
 * All specs sourced from:
 *   - aprilia.com official RSV4 Factory technical specifications
 *   - motorcyclespecs.co.za (cross-referenced)
 *   - motorcycle.com, cycleworld.com
 *
 * Every spec formatted as [label, value] pair per GEMINI.md specification.
 */

export const parts = [
  {
    id: "engine",
    index: "01",
    name: "ENGINE",
    pitch: "217 HP. 13,000 RPM. NO APOLOGIES.",
    specs: [
      ["DISPLACEMENT", "1,099 cc"],
      ["PEAK POWER", "217 HP @ 13,000 rpm"],
      ["PEAK TORQUE", "125 Nm @ 10,500 rpm"],
      ["ARCHITECTURE", "65° V4 DOHC, 4-valve"],
    ],
    why: "A narrow 65° longitudinal V4 concentrates mass inside the frame and revs with brutal inertia-free speed.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "frame",
    index: "02",
    name: "FRAME",
    pitch: "ALUMINIUM FORGED FROM MOTOGP PARANOIA.",
    specs: [
      ["CONSTRUCTION", "Dual-beam aluminium"],
      ["CHASSIS ELEMENTS", "Pressed + cast sheet"],
      ["WHEELBASE", "1,435.8 mm"],
      ["WET WEIGHT", "202 kg (90% fuel)"],
    ],
    why: "Adjustable headstock angle, engine height, and swingarm pivot — chassis geometry tuned to the circuit, not compromise.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "front-fork",
    index: "03",
    name: "FRONT FORK",
    pitch: "ÖHLINS READS THE ASPHALT BEFORE YOUR SYNAPSES FIRE.",
    specs: [
      ["SYSTEM", "Öhlins Smart EC 2.0 (NIX)"],
      ["STANCHION", "Ø 43 mm TiN surface"],
      ["TRAVEL", "125 mm"],
      ["CALIBRATION", "Semi-active electronic OBTi"],
    ],
    why: "Smart EC 2.0 calculates braking pitch and corner entry forces in real time — zero brake-dive without harsh bottoming.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "front-brakes",
    index: "04",
    name: "FRONT BRAKES",
    pitch: "330 MM OF PURE RADIAL DECELERATION.",
    specs: [
      ["ROTORS", "Dual 330 mm floating stainless"],
      ["CALIPERS", "Brembo Stylema® monobloc"],
      ["PISTONS", "4 × Ø 30 mm opposing"],
      ["ASSIST", "Bosch Cornering ABS + RLM"],
    ],
    why: "Stylema calipers shed unsprung mass while increasing fluid flow and heat dissipation under sustained threshold braking.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "electronics",
    index: "05",
    name: "ELECTRONICS",
    pitch: "SIX AXES OF INERTIAL DOMINANCE.",
    specs: [
      ["INERTIAL UNIT", "6-axis Bosch IMU (a-PRC)"],
      ["RIDING MODES", "6 profiles (3 Road / 3 Track)"],
      ["CONTROLS", "ATC, AWC, AEB, ALC, APL, ACC"],
      ["DISPLAY", "5-inch color TFT + Aprilia MIA"],
    ],
    why: "Direct telemetry lineage from WSBK championship machines — adjustable throttle sensitivity, engine brake, and wheelie limits on the fly.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "winglets",
    index: "06",
    name: "WINGLETS",
    pitch: "DOWNFORCE BUILT IN. DRAG IS AN AFTERTHOUGHT.",
    specs: [
      ["AERO HERITAGE", "RS-GP MotoGP aero tunnels"],
      ["FAIRING", "Double-wall integrated ducts"],
      ["STABILITY", "Anti-wheelie high-speed pressure"],
      ["COOLING", "Integrated radiator extractors"],
    ],
    why: "MotoGP-derived fairing tunnels generate high-velocity downforce to pin the front tyre at 300 km/h without protruding wing drag.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "exhaust",
    index: "07",
    name: "EXHAUST",
    pitch: "EURO 5+. FULL-SONG V4 RESONANCE.",
    specs: [
      ["MANIFOLD", "4-into-2-into-1 collector"],
      ["REGULATION", "Euro 5+ homologated"],
      ["HARDWARE", "Stainless headers + lambda sensors"],
      ["UPGRADE", "Akrapovič titanium race slip-on"],
    ],
    why: "Tuned header lengths extract maximum low-end torque while routing extreme catalytic heat away from the rear suspension and rider.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "swingarm-shock",
    index: "08",
    name: "SWINGARM + SHOCK",
    pitch: "REAR TRACTION TUNED TO TENTHS OF A MILLIMETRE.",
    specs: [
      ["SWINGARM", "Inverted double-braced aluminium"],
      ["MONOSHOCK", "Öhlins TTX (Smart EC 2.0)"],
      ["TRAVEL", "115 mm rear axle travel"],
      ["PIGGYBACK", "Electronic damping reservoir"],
    ],
    why: "Inverted lower-bracing geometry drops the centre of gravity and counters swingarm twist under 217 hp full-lean acceleration.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "wheels",
    index: "09",
    name: "WHEELS",
    pitch: "FORGED ALUMINIUM. MINIMAL ROTATIONAL INERTIA.",
    specs: [
      ["RIMS", "Forged 5-spoke aluminium alloy"],
      ["FRONT TYRE", "120/70 ZR 17 tubeless"],
      ["REAR TYRE", "200/55 ZR 17 tubeless"],
      ["REAR BRAKE", "220 mm disc, 2-piston Brembo"],
    ],
    why: "Forged alloy construction cuts crucial rotating gyroscopic mass at the wheel perimeter for razor-sharp directional changes.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "cockpit",
    index: "10",
    name: "COCKPIT",
    pitch: "RACE TELEMETRY. ZERO DISTRACTION.",
    specs: [
      ["INSTRUMENT", "5-inch optically bonded TFT"],
      ["SWITCHGEAR", "Backlit ergonomic CAN controls"],
      ["TELEMETRY", "Integrated GPS + lap trigger"],
      ["ERGONOMICS", "840 mm seat + 17.9L fuel tank"],
    ],
    why: "Optical bonding eliminates glare under full sunlight; dedicated Race view puts split lap times, lean angle, and gear selection front-and-centre.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
];

export const PARTS = parts;
export const PART_IDS = parts.map((p) => p.id);
export default parts;
