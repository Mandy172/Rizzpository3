import { create } from 'zustand';

export const useScrollStore = create((set) => ({
  progress: 0,
  scrollProgress: 0,
  scrollVelocity: 0,
  activePartId: null,
  activePart: null,
  hoveredPart: null,
  activePartScreenPos: null,
  modelReady: false,
  muted: false,
  lowPower: false,
  isTouch: false,
  inspectionMode: false,
  inspectionView: 'default', // 'default' | 'front' | 'side' | 'rear' | 'engine' | 'cockpit'

  setProgress: (progress) => set({ progress, scrollProgress: progress }),
  setScrollProgress: (scrollProgress) => set({ progress: scrollProgress, scrollProgress }),
  setScrollVelocity: (scrollVelocity) => set({ scrollVelocity }),
  setActivePartId: (activePartId) => set({ activePartId, activePart: activePartId }),
  setActivePart: (activePart) => set({ activePartId: activePart, activePart }),
  setHoveredPart: (hoveredPart) => set({ hoveredPart }),
  setActivePartScreenPos: (activePartScreenPos) => set({ activePartScreenPos }),
  setModelReady: (modelReady) => set({ modelReady }),
  setMuted: (muted) => set((state) => ({ muted: typeof muted === 'function' ? muted(state.muted) : muted })),
  toggleMuted: () => set((state) => ({ muted: !state.muted })),
  setLowPower: (lowPower) => set((state) => ({ lowPower: typeof lowPower === 'function' ? lowPower(state.lowPower) : lowPower })),
  setIsTouch: (isTouch) => set({ isTouch }),
  setInspectionMode: (inspectionMode) => set((state) => ({ inspectionMode: typeof inspectionMode === 'function' ? inspectionMode(state.inspectionMode) : inspectionMode })),
  toggleInspectionMode: () => set((state) => ({ inspectionMode: !state.inspectionMode })),
  setInspectionView: (inspectionView) => set({ inspectionView }),
}));

export const useStore = useScrollStore;
export default useScrollStore;
