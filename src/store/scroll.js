import { create } from "zustand";

export const useScrollStore = create((set) => ({
  progress: 0,
  scrollVelocity: 0,
  activePartId: null,
  hoveredPart: null,
  activePartScreenPos: null,
  modelReady: false,
  muted: false,

  setProgress: (progress) => set({ progress }),
  setScrollVelocity: (scrollVelocity) => set({ scrollVelocity }),
  setActivePartId: (activePartId) => set({ activePartId }),
  setHoveredPart: (hoveredPart) => set({ hoveredPart }),
  setActivePartScreenPos: (activePartScreenPos) => set({ activePartScreenPos }),
  setModelReady: (modelReady) => set({ modelReady }),
  setMuted: (muted) => set({ muted }),
  toggleMuted: () => set((state) => ({ muted: !state.muted })),
}));

export default useScrollStore;
