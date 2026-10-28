# 3D Motorcycle Model Architecture & Pipeline (MKT R1 / RS 457)

## 1. Overview
This project features an interactive, fully-modular 3D motorcycle model inspired by the **Aprilia RS 457** sportbike design, branded for the **MKT Cinematic Experience**.

The 3D model is built with high-fidelity physically-based rendering (PBR) materials, parametric lofted aerodynamic surfaces, realistic proportions, and an exploded-anatomy hierarchy for telemetry inspection.

---

## 2. Model Specifications & Proportions

| Metric | Measurement | Real Reference Equivalent |
|---|---|---|
| **Length (X-axis)** | 1.948 m | 2,080 mm |
| **Height (Y-axis)** | 1.220 m | 1,130 mm (with mirrors) |
| **Width (Z-axis)** | 0.748 m | 790 mm |
| **Wheelbase** | 1.410 m | 1,410 mm |
| **Wheel Diameter** | 0.600 m | 17-inch rim + road tyre |
| **Front Fork Rake** | 22.2° | 24.1° |
| **GLB Asset Size** | 705.4 KB | Optimized for 60 FPS WebGL |

---

## 3. Component Hierarchy (18 Sub-Assemblies)

The exported model (`public/models/mkt-r1.glb` and `public/bike.glb`) is organized into 18 independent nodes:

1. **`FrontFairing`**:
   - Aerodynamic nose cowl with sharp leading chin
   - Central Ram-Air intake duct
   - "Double-layer" MotoGP-derived aerodynamic side fairings with negative-space air channels
   - Lower belly pan (chin spoiler wrapping the crankcase)
   - Racing red & silver speed graphic strakes
2. **`HeadlightAssembly`**:
   - Dual projector low/high beam lamps in black bezels
   - Wing-shaped bright white LED DRL (Daytime Running Light) light-pipes
   - Optical glass lenses and red accent strakes
3. **`Windscreen`**:
   - Swept-back aerodynamic bubble windscreen with dark smoked physical material (transmission 0.85, opacity 0.48)
4. **`FuelTank`**:
   - Muscular sculpted sportbike tank with flat top spine
   - Deep knee indents for aerodynamic tuck
   - Aircraft-style flush aluminum fuel filler cap
   - Rubber tank protector pad and red shoulder speed decals
5. **`FrontWheel`**:
   - 17" gloss black alloy wheel with 10 split Y-spokes
   - 110/70-ZR17 low-profile sport road tire
   - Vivid racing red rim-tape stripe along the inner bead
6. **`RearWheel`**:
   - 17" gloss black alloy wheel matching the front
   - Wide 150/60-ZR17 sport road tire
   - Matching racing red rim-tape stripe
7. **`FrontBrakeAssembly`**:
   - 320 mm stainless steel floating brake disc with ventilation slots
   - Inner black carrier with 6 floating rivet bobbins
   - Radial-mount ByBre 4-piston monobloc caliper with red accent badge
8. **`RearBrakeAssembly`**:
   - 220 mm ventilated rear steel rotor
   - Single-piston floating rear caliper
9. **`FrontForks`**:
   - 41mm inverted (USD) telescopic fork stanchions in anodized **Öhlins Gold** (`#d4af37`, metalness 0.96)
   - Chrome lower slider tubes and bottom cast fork feet with axle clamps
   - CNC machined aluminum upper and lower triple clamps
   - Smooth curved aerodynamic front mudguard hugging the front tire
10. **`RearSuspension`**:
    - Central gas monoshock damper cylinder
    - Heavy-duty coil spring in **Racing Red** (`#e10600`)
11. **`Frame`**:
    - Satin aluminum twin-spar (dual-beam) perimeter chassis spanning from steering headstock to swingarm pivot plates
    - Lightweight tubular aluminum rear subframe trusses
    - CNC rearset brackets and knurled footpegs
12. **`EngineAssembly`**:
    - 457cc liquid-cooled parallel-twin engine canted forward ~30° as a stressed chassis member
    - 8 horizontal cooling/stiffening ribs along the cylinder block
    - DOHC cylinder head cover with spark plug wells
    - Distinctive circular right-side clutch cover with perimeter casing bolts, central boss, and oil level sight glass
    - Left-side stator/alternator cover, water pump, and starter motor
13. **`Radiator`**:
    - High-efficiency curved radiator core with stone guard mesh and side end-tanks
14. **`ExhaustAssembly`**:
    - Twin stainless steel header pipes sweeping down from cylinder ports
    - 2-into-1 underbelly merge collector box
    - Compact silencer with satin titanium heat shield and slash-cut outlet tip exiting low by the right footpeg
15. **`Swingarm`**:
    - Asymmetric cast aluminum swingarm with straight left arm and sculpted banana right arm to clear the underbelly silencer
    - Pivot cross-brace and rear axle tensioner blocks
16. **`ChainAndSprockets`**:
    - 520 gold link racing drive chain
    - Laser-cut rear steel sprocket with 5 lightening holes
    - Front engine countershaft drive sprocket
17. **`SeatAndTail`**:
    - Ergonomic two-piece split seat: scooped rider saddle (~0.80m height) and raised passenger pillion cowl
    - Sharp aerodynamic tail unit with integrated red winglet strakes
    - Dual razor-blade LED tail lights and tail tidy with license plate
18. **`HandlebarsAndMirrors`**:
    - Clip-on handlebars angled back ~12° with rubber grips, levers, and brake fluid reservoir
    - 5-inch full-color TFT digital telemetry instrument screen
    - Aerodynamic fairing-mounted mirrors with forward-facing LED turn indicators

---

## 4. How to Rerun, Modify, or Replace the Model

### Option A: Three.js Modular Generator (No External Software Required)
To regenerate or tweak the model:
1. Edit the parameters or materials in [`scripts/build_rs457_mkt_model.mjs`](file:///Users/sujaytudu/Documents/Open Source/scripts/build_rs457_mkt_model.mjs).
2. Run the generator script:
   ```bash
   node scripts/build_rs457_mkt_model.mjs
   ```
3. This automatically updates both `public/models/mkt-r1.glb` and `public/bike.glb`.

### Option B: Blender Procedural Generation
If Blender is installed:
1. Run the headless generator script:
   ```bash
   blender -b --python assets/3d/generate_mkt_r1_blender.py
   ```
2. This creates `assets/3d/mkt-r1.blend` and exports `public/models/mkt-r1.glb`.

---

## 5. Website Integration

The model seamlessly integrates with:
- **Three.js / React Three Fiber canvas** ([`ThreeCanvas.jsx`](file:///Users/sujaytudu/Documents/Open Source/src/three/ThreeCanvas.jsx))
- **Interactive Component Highlighting & Shaders** ([`BikeModel.jsx`](file:///Users/sujaytudu/Documents/Open Source/src/three/BikeModel.jsx), [`meshMap.js`](file:///Users/sujaytudu/Documents/Open Source/src/three/meshMap.js))
- **GSAP & Lenis Camera Choreography** ([`cameraRig.js`](file:///Users/sujaytudu/Documents/Open Source/src/three/cameraRig.js), [`ScrollContainer.jsx`](file:///Users/sujaytudu/Documents/Open Source/src/sections/ScrollContainer.jsx))
- **Live Telemetry HUD & Leader Line** ([`HUDOverlay.jsx`](file:///Users/sujaytudu/Documents/Open Source/src/hud/HUDOverlay.jsx))
