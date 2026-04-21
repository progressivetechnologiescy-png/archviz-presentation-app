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

  // CLOUD FETCHING PIPELINE
  isFetchingAssets: false,
  fetchCloudAssets: async (supabaseClient, projectId = "demo_project") => {
    if (!supabaseClient) return; // Skip if db not configured
    set({ isFetchingAssets: true });
    try {
      const { data, error } = await supabaseClient
        .from('presentation_assets')
        .select('*')
        .eq('project_id', projectId);
        
      if (error) {
        console.error("Cloud DB Error assets:", error);
      } else if (data) {
        const renders = data.filter(d => d.asset_type === 'render').map(d => d.asset_url);
        if (renders.length > 0) {
          set({ customRenders: renders });
        }
      }

      // Fetch Config State (GPS, Lighting, etc)
      const { data: configData, error: configError } = await supabaseClient
        .from('properties_config')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (!configError && configData) {
        if (configData.gps_coordinates) set({ customGPS: configData.gps_coordinates });
        if (configData.lighting_preset) set({ lightingPreset: configData.lighting_preset });
        if (configData.active_material) set({ activeMaterial: configData.active_material });
      }
    } catch (e) {
      console.error("Cloud Connection Failed:", e);
    } finally {
      set({ isFetchingAssets: false });
    }
  }
}));
