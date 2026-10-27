import { create } from 'zustand';

export const useScrollStore = create((set) => ({
  progress: 0,
  scrollVelocity: 0,
  activePartId: null,
  hoveredPart: null,
  activePartScreenPos: null,
  modelReady: false,
  muted: false,
  lowPower: false,

  setProgress: (progress) => set({ progress }),
  setScrollVelocity: (scrollVelocity) => set({ scrollVelocity }),
  setActivePartId: (activePartId) => set({ activePartId }),
  setHoveredPart: (hoveredPart) => set({ hoveredPart }),
  setActivePartScreenPos: (activePartScreenPos) => set({ activePartScreenPos }),
  setModelReady: (modelReady) => set({ modelReady }),
  setMuted: (muted) => set((state) => ({ muted: typeof muted === 'function' ? muted(state.muted) : muted })),
  setLowPower: (lowPower) => set((state) => ({ lowPower: typeof lowPower === 'function' ? lowPower(state.lowPower) : lowPower })),
}));
