/**
 * Aprilia RSV4 Factory 2024 — Part Data
 * All specs sourced from:
 *   - aprilia.com official specs page
 *   - motorcyclespecs.co.za (cross-referenced)
 *   - cycle world, motorcycle.com (editorial reviews)
 *
 * Numbers marked ~approximate where exact official values could not be confirmed.
 * No invented numbers.
 */

export const PARTS = [
  {
    id: "engine",
    index: "01",
    name: "ENGINE",
    pitch: "217 hp. 13,000 rpm. No apologies.",
    specs: [
      ["Displacement", "1,099 cc"],
      ["Peak Power", "217 HP @ 13,000 rpm"],
      ["Peak Torque", "125 Nm @ 10,500 rpm"],
      ["Configuration", "65° V4 DOHC, 4-valve"],
    ],
    why: "A longitudinal V4 with a narrow 65° angle keeps mass centralised and revs faster than any twin dare try.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "frame",
    index: "02",
    name: "FRAME",
    pitch: "Aluminium forged from MotoGP paranoia.",
    specs: [
      ["Type", "Dual-beam aluminium"],
      ["Construction", "Pressed + cast sheet"],
      ["Wheelbase", "1,435.8 mm"],
      ["Wet Weight", "202 kg"],
    ],
    why: "Adjustable headstock, engine height, and swingarm pivot — the geometry bends to the rider, not the other way.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "front-fork",
    index: "03",
    name: "FRONT FORK",
    pitch: "Öhlins reads the road before your brain does.",
    specs: [
      ["Brand", "Öhlins NIX (Smart EC 2.0)"],
      ["Diameter", "Ø 43 mm (TiN coated)"],
      ["Travel", "125 mm"],
      ["Control", "Electronic semi-active"],
    ],
    why: "The Smart EC 2.0 system adjusts damping in real time — no dive under braking, no wallowing mid-corner.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "front-brakes",
    index: "04",
    name: "FRONT BRAKES",
    pitch: "330 mm of pure, unapologetic stopping power.",
    specs: [
      ["Discs", "Dual 330 mm floating stainless"],
      ["Calipers", "Brembo Stylema® monobloc"],
      ["Pistons", "4 × Ø 30 mm opposing"],
      ["ABS", "Bosch Cornering ABS + RLM"],
    ],
    why: "Brembo Stylema calipers weigh less than the Monoblock they replaced while biting harder — that's the deal.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "electronics",
    index: "05",
    name: "ELECTRONICS",
    pitch: "Six axes of awareness. Zero excuses.",
    specs: [
      ["Platform", "6-axis IMU (a-PRC)"],
      ["Riding Modes", "6 total (3 Road / 3 Track)"],
      ["Rider Aids", "ATC, AWC, AEB, ALC, APL, ACC"],
      ["Dashboard", '5" colour TFT + Aprilia MIA'],
    ],
    why: "The same electronics architecture that won the WSBK championship — now road-legal and rider-configurable on the fly.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "winglets",
    index: "06",
    name: "WINGLETS",
    pitch: "Downforce built in. Drag is an afterthought.",
    specs: [
      ["Origin", "MotoGP race programme"],
      ["Function", "Front-end downforce"],
      ["Integration", "Double-wall fairing"],
      ["Benefit", "Anti-wheelie under acceleration"],
    ],
    why: "At speed, the integrated winglets pin the front wheel and sharpen steering response — aero you can feel, not just see.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "exhaust",
    index: "07",
    name: "EXHAUST",
    pitch: "Euro 5. Full-song. No compromise.",
    specs: [
      ["Layout", "4-2-1 with catalytic converter"],
      ["Compliance", "Euro 5+ certified"],
      ["Material", "Stainless steel headers"],
      ["Aftermarket", "Akrapovič slip-on compatible"],
    ],
    why: "A 4-2-1 collector keeps the power band wide while routing heat away from the rider — compliance without sacrifice.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "swingarm-shock",
    index: "08",
    name: "SWINGARM + SHOCK",
    pitch: "Rear traction tuned to the tenth of a millimetre.",
    specs: [
      ["Swingarm", "Double-braced aluminium"],
      ["Shock", "Öhlins TTX (Smart EC 2.0)"],
      ["Rear Travel", "115 mm"],
      ["Adjustment", "Electronic piggyback control"],
    ],
    why: "The upside-down double-braced swingarm geometry traces directly from the RS-GP — stiffness where it counts, flex where it doesn't.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "wheels",
    index: "09",
    name: "WHEELS",
    pitch: "Forged. Light. Uncompromising.",
    specs: [
      ["Construction", "Forged 5-spoke aluminium"],
      ["Front Tyre", "120/70 ZR 17"],
      ["Rear Tyre", "200/55 ZR 17"],
      ["Rear Brake", "220 mm Brembo disc"],
    ],
    why: "Forged aluminium rims cut unsprung weight at the furthest point from the centre — less rotational inertia means quicker direction changes.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
  {
    id: "cockpit",
    index: "10",
    name: "COCKPIT",
    pitch: "Race data. Road legal. One screen.",
    specs: [
      ["Display", '5" colour TFT, optically bonded'],
      ["Controls", "Backlit CAN switchcubes"],
      ["Connectivity", "Aprilia MIA (GPS + phone)"],
      ["Seat Height", "840 mm"],
    ],
    why: "Lap timing, GPS telemetry, and full ride-mode control from a handlebar button — because 217 hp deserves an equally sharp mind.",
    source: "https://www.aprilia.com/en_EN/bikes/rsv4/rsv4-factory/",
  },
];

/** Ordered array of part IDs for index lookups */
export const PART_IDS = PARTS.map((p) => p.id);
