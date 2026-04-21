import { create } from 'zustand';

// Simple store to manage our 3D UI states
export const useViewerStore = create((set) => ({
  // Environment / Lighting
  lightingPreset: 'noon', // 'morning', 'noon', 'night'
  setLightingPreset: (preset) => set({ lightingPreset: preset }),

  // Material Swap state
  activeMaterial: 'marble', // 'marble', 'wood', 'concrete'
  setActiveMaterial: (material) => set({ activeMaterial: material }),

  // Camera Tour Mode
  isTouring: false,
  toggleTouring: () => set((state) => ({ isTouring: !state.isTouring })),

  // Active Annotation state
  activeAnnotation: null,
  setActiveAnnotation: (id) => set({ activeAnnotation: id }),

  // Walk Engine state (WASD / D-Pad)
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  lookLeft: false,
  lookRight: false,
  setMovement: (direction, isMoving) => set((state) => ({ [direction]: isMoving })),

  customFloorplans: [],
  activeFloorplanId: null,
  
  // Interactive 360 Spatial Tour Database
  activeTourNodeId: null,
  customTourNodes: {},
  
  customRenders: [],
  customGPS: 'Beverly Hills, CA',
  
  setActiveFloorplanId: (id) => set({ activeFloorplanId: id }),
  setCustomFBX: (url) => set({ customFBX: url }),
  setCustomFloorplan: (url) => set({ customFloorplan: url }),
  setCustomPanorama: (url) => set({ customPanorama: url }),
  setCustomGPS: (addressOrCoords) => set({ customGPS: addressOrCoords }),
  setActiveTourNodeId: (id) => set({ activeTourNodeId: id }),
  
  addCustomRender: (url) => set((state) => ({ customRenders: [...state.customRenders, url] })),
  clearCustomRenders: () => set({ customRenders: [] }),
}));
