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

  // Fullscreen Lightbox State (for hiding headers)
  isLightboxOpen: false,
  setLightboxOpen: (isOpen) => set({ isLightboxOpen: isOpen }),

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
  geminiApiKey: '',
  aiContext: '',
  
  setActiveFloorplanId: (id) => set({ activeFloorplanId: id }),
  primaryModel: null,
  customFBX: null,
  customGLB: null,
  customUSDZ: null,
  setCustomFBX: (url) => set({ customFBX: url }),
  setCustomGLB: (url) => set({ customGLB: url }),
  setCustomUSDZ: (url) => set({ customUSDZ: url }),
  setCustomFloorplan: (url) => set({ customFloorplan: url }),
  setCustomPanorama: (url) => set({ customPanorama: url }),
  setCustomGPS: (addressOrCoords) => set({ customGPS: addressOrCoords }),
  setGeminiApiKey: (key) => set({ geminiApiKey: key }),
  setAiContext: (context) => set({ aiContext: context }),
  setActiveTourNodeId: (id) => set({ activeTourNodeId: id }),
  
  // Complex Renders Array [{ id, folder_name, image_url }]
  customRenders: [],
  addCustomRender: (renderObj) => set((state) => ({ customRenders: [...state.customRenders, renderObj] })),
  clearCustomRenders: () => set({ customRenders: [] }),

  // CLOUD FETCHING PIPELINE
  isFetchingAssets: false,
  fetchCloudAssets: async (supabaseClient, projectId = "demo_project") => {
    if (!supabaseClient) return; // Skip if db not configured
    set({ isFetchingAssets: true });
    try {
      // Fetch Core Models and Legacy Data
      const { data, error } = await supabaseClient
        .from('presentation_assets')
        .select('*')
        .eq('project_id', projectId);
        
      if (error) {
        console.error("Cloud DB Error assets:", error);
      } else if (data) {
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const modelFbx = data.find(d => d.asset_type === '3d_model_fbx');
        const modelGlb = data.find(d => d.asset_type === '3d_model_glb');

        if (modelFbx && modelGlb) {
          set({ customFBX: modelFbx.asset_url, customGLB: modelGlb.asset_url });
          if (new Date(modelFbx.created_at) > new Date(modelGlb.created_at)) {
            set({ primaryModel: modelFbx.asset_url });
          } else {
            set({ primaryModel: modelGlb.asset_url });
          }
        } else {
          if (modelFbx) set({ customFBX: modelFbx.asset_url, primaryModel: modelFbx.asset_url });
          if (modelGlb) set({ customGLB: modelGlb.asset_url, primaryModel: modelGlb.asset_url });
        }

        const modelUsdz = data.find(d => d.asset_type === '3d_model_usdz');
        if (modelUsdz) set({ customUSDZ: modelUsdz.asset_url });

        const floorplan = data.find(d => d.asset_type === 'floorplan');
        if (floorplan) set({ customFloorplan: floorplan.asset_url });

        const panorama = data.find(d => d.asset_type === 'panorama');
        if (panorama) set({ customPanorama: panorama.asset_url });
      }

      // Fetch Categorized Renders
      const { data: renderData, error: renderError } = await supabaseClient
        .from('project_renders')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (!renderError && renderData) {
        set({ customRenders: renderData });
      } else if (data) {
        // Fallback: If the new table fails, load the legacy renders
        const legacyRenders = data.filter(d => d.asset_type === 'render').map(d => ({ id: d.id, folder_name: 'Uncategorized', image_url: d.asset_url }));
        if (legacyRenders.length > 0) set({ customRenders: legacyRenders });
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
        if (configData.gemini_api_key) set({ geminiApiKey: configData.gemini_api_key });
        if (configData.ai_context) set({ aiContext: configData.ai_context });
      }
    } catch (e) {
      console.error("Cloud Connection Failed:", e);
    } finally {
      set({ isFetchingAssets: false });
    }
  }
}));
