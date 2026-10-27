// ALL assumptions about the shared contract live in this file. Read-only: never writes to the store.
import * as storeMod from '../store/scroll.js';
import * as partsMod from '../data/parts.js';

export const useStore = storeMod.useScrollStore ?? storeMod.useStore ?? storeMod.default;

// Scroll windows (progress 0..1). Tune to Sujay's choreography.
export const STAGES = {
  hero: [0, 0.04],
  stats: [0.4, 0.6],
  marquee: [0.68, 0.82],
  finale: [0.95, 1.01],
};

const norm = (p, i) => {
  const raw = p.specs ?? p.specifications ?? [];
  const specs = Array.isArray(raw)
    ? raw.map((s) => (Array.isArray(s) ? s : [s.label ?? s.name ?? s.key, s.value ?? s.val]))
    : Object.entries(raw);
  return {
    id: p.id ?? i,
    name: p.name ?? p.title ?? '',
    pitch: p.pitch ?? p.tagline ?? p.description ?? '',
    specs: specs.map(([k, v]) => [String(k), String(v)]),
    why: p.why ?? p.whyItMatters ?? p.why_it_matters ?? '',
  };
};
export const PARTS = (partsMod.default ?? partsMod.parts ?? partsMod.PARTS ?? []).map(norm);

export const pad = (n) => String(n).padStart(2, '0');
export const useInRange = ([a, b]) => useStore((s) => s.progress >= a && s.progress <= b);
export const useActiveIndex = () => {
  const id = useStore((s) => s.activePartId);
  if (id == null) return -1;
  let i = PARTS.findIndex((p) => p.id === id);
  if (i < 0 && typeof id === 'number' && PARTS[id]) i = id;
  return i;
};
// Accepts px, or 0..1 normalized.
export const toPx = (p) => {
  if (!p) return null;
  let { x, y } = p;
  if (x >= 0 && x <= 1 && y >= 0 && y <= 1) { x *= innerWidth; y *= innerHeight; }
  return { x, y };
};
