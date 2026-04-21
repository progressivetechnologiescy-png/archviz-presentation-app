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

  customFloorplans: [
    { id: 'gf', name: 'Ground Floor', url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1200&auto=format&fit=crop' },
    { id: 'f1', name: 'First Floor', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop' },
    { id: 'roof', name: 'Roof Deck', url: 'https://images.unsplash.com/photo-1600566753086-00f18efc2295?q=80&w=1200&auto=format&fit=crop' }
  ],
  activeFloorplanId: 'gf',
  
  // Interactive 360 Spatial Tour Database
  activeTourNodeId: 'living_room',
  customTourNodes: {
    'living_room': {
      id: 'living_room',
      name: 'Grand Living Room',
      url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/2294472375_24a3b8ef46_o.jpg',
      hotspots: [
        { id: 'h1', targetId: 'kitchen', position: [-5, -1, -5], label: 'Walk to Kitchen' },
        { id: 'h2', targetId: 'patio', position: [8, -1, 2], label: 'Exit to Patio' }
      ]
    },
    'kitchen': {
      id: 'kitchen',
      name: 'Chef Kitchen',
      url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=4000&auto=format&fit=crop', // Temporary wide fallback
      hotspots: [
        { id: 'h3', targetId: 'living_room', position: [5, -1, 5], label: 'Back to Living Room' }
      ]
    },
    'patio': {
      id: 'patio',
      name: 'Poolside Patio',
      url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=4000&auto=format&fit=crop', // Temporary wide fallback
      hotspots: [
        { id: 'h4', targetId: 'living_room', position: [-8, -1, -2], label: 'Back Inside' }
      ]
    }
  },
  customRenders: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop'
  ],
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
