# Fairing prototype 001 — refinement

This is a non-production derivative of the CGC Motorcycle (Scythe) source model. The original author is KuhnIndustries. The model and derived assets remain under CC BY-NC-SA 3.0; attribution and the preserved license are in [`../../../CGC-Motorcycle-License.html`](../../../CGC-Motorcycle-License.html) and [`../../../README-CGC-Motorcycle.md`](../../../README-CGC-Motorcycle.md).

The final Blender source and disposable GLB are `fairing-prototype-001-refined.blend` and `fairing-prototype-001-refined.glb`. The Blender file contains the hidden original-shell backup. The GLB omits that backup and keeps `Fairing_Left_Lower` as a separate child under `Bodywork`.

The source had 21 open boundary edges in the selected face region. The refinement retains the source-open-boundary faces in the main shell; it adds no geometry and the full motorcycle remains at 428,688 evaluated triangles. The separated panel has 887 faces and 1,787 evaluated triangles. See `boundary-diagnostic.json`, `boundary-root-cause.json`, and `glb-reimport-report.json` for per-edge and round-trip results.

The panel fit and translation/rotation tests pass at the measured geometry precision. The boundary closeup still shows an angular contour because the source has no authored seam there. Treat this as a modeling experiment, not a production-ready modular asset. No website or production model files are part of this iteration.
