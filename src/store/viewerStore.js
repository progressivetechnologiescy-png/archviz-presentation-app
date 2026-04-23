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
  addCustomFloorplan: (floorplanObj) => set((state) => ({ customFloorplans: [...state.customFloorplans, floorplanObj] })),
  removeCustomFloorplan: (id) => set((state) => ({ 
    customFloorplans: state.customFloorplans.filter(f => f.id !== id),
    activeFloorplanId: state.activeFloorplanId === id ? (state.customFloorplans.find(f => f.id !== id)?.id || null) : state.activeFloorplanId
  })),
  updateFloorplanLabel: async (supabaseClient, id, newLabel) => {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient.from('project_floorplans').update({ level_name: newLabel }).eq('id', id);
      if (!error) {
        set((state) => ({
          customFloorplans: state.customFloorplans.map(f => f.id === id ? { ...f, level_name: newLabel } : f)
        }));
      }
    } catch (e) {
      console.error('Update floorplan label failed', e);
    }
  },
  updateFloorplanPropertyType: async (supabaseClient, id, newType) => {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient.from('project_floorplans').update({ property_type: newType }).eq('id', id);
      if (!error) {
        set((state) => ({
          customFloorplans: state.customFloorplans.map(f => f.id === id ? { ...f, property_type: newType } : f)
        }));
      }
    } catch (e) {
      console.error('Update floorplan property type failed', e);
    }
  },
  updateFloorplanOrder: async (supabaseClient, id, newOrder) => {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient.from('project_floorplans').update({ order_index: newOrder }).eq('id', id);
      if (!error) {
        set((state) => ({
          customFloorplans: state.customFloorplans.map(f => f.id === id ? { ...f, order_index: newOrder } : f)
        }));
      }
    } catch (e) {
      console.error('Update floorplan order failed', e);
    }
  },
  updateFloorplanOrdersBatch: async (supabaseClient, floorplanMap) => {
    // floorplanMap is an object: { [id]: new_order_index }
    if (!supabaseClient) return;
    
    // 1. Optimistic UI update instantly
    set((state) => ({
      customFloorplans: (state.customFloorplans || []).map(f => {
        if (f.id && floorplanMap[f.id] !== undefined) {
          return { ...f, order_index: floorplanMap[f.id] };
        }
        return f;
      })
    }));

    // 2. Background database sync
    try {
      for (const [id, newOrder] of Object.entries(floorplanMap)) {
        await supabaseClient
          .from('project_floorplans')
          .update({ order_index: newOrder })
          .eq('id', id);
      }
    } catch (e) {
      console.error('Batch update floorplan orders failed', e);
    }
  },
  primaryModel: null,
  customFBX: null,
  customGLB: null,
  customUSDZ: null,

  // Branding & Overview
  projectTitle: 'The Pinnacle Residence',
  companyName: 'ARCHVIZ STUDIO LTD.',
  projectDescription: 'Welcome to the ultimate expression of modern architectural design. Nestled in the prestigious hills, this property features breathtaking panoramic views, seamless indoor-outdoor living, and state-of-the-art cinematic finishes.',
  logoUrl: null,
  overviewMediaType: 'images',
  overviewVideoUrl: null,

  setProjectTitle: (title) => set({ projectTitle: title }),
  setCompanyName: (name) => set({ companyName: name }),
  setProjectDescription: (desc) => set({ projectDescription: desc }),
  setLogoUrl: (url) => set({ logoUrl: url }),
  setOverviewMediaType: (type) => set({ overviewMediaType: type }),
  setOverviewVideoUrl: (url) => set({ overviewVideoUrl: url }),

  updateBrandingConfig: async (supabaseClient, updates) => {
    if (!supabaseClient) return;
    set(updates); // Optimistic UI
    try {
      // Get existing config to merge with
      const { data: existing } = await supabaseClient
        .from('properties_config')
        .select('*')
        .eq('project_id', 'demo_project')
        .maybeSingle();
      
      const payload = {
        project_id: 'demo_project',
        title: updates.projectTitle !== undefined ? updates.projectTitle : existing?.title || 'The Pinnacle Residence',
        company_name: updates.companyName !== undefined ? updates.companyName : existing?.company_name,
        project_description: updates.projectDescription !== undefined ? updates.projectDescription : existing?.project_description,
        logo_url: updates.logoUrl !== undefined ? updates.logoUrl : existing?.logo_url,
        overview_media_type: updates.overviewMediaType !== undefined ? updates.overviewMediaType : existing?.overview_media_type,
        overview_video_url: updates.overviewVideoUrl !== undefined ? updates.overviewVideoUrl : existing?.overview_video_url,
      };

      const { error } = await supabaseClient.from('properties_config').upsert(payload);
      if (error) console.error("Failed to update branding config:", error);
    } catch (e) {
      console.error("Failed to update branding config:", e);
    }
  },

  setCustomFBX: (url) => set({ customFBX: url }),
  setCustomGLB: (url) => set({ customGLB: url }),
  setCustomUSDZ: (url) => set({ customUSDZ: url }),
  setCustomFloorplan: (url) => set({ customFloorplan: url }),
  setCustomPanorama: (url) => set({ customPanorama: url }),
  setCustomGPS: (addressOrCoords) => set({ customGPS: addressOrCoords }),
  setGeminiApiKey: (key) => set({ geminiApiKey: key }),
  setAiContext: (context) => set({ aiContext: context }),
  setActiveTourNodeId: (id) => set({ activeTourNodeId: id }),
  isGlobalScrolled: false,
  setGlobalScrolled: (val) => set({ isGlobalScrolled: val }),
  
  // Complex Renders Array [{ id, folder_name, image_url }]
  customRenders: [],
  addCustomRender: (renderObj) => set((state) => ({ customRenders: [...state.customRenders, renderObj] })),
  clearCustomRenders: () => set({ customRenders: [] }),
  toggleOverviewRender: async (supabaseClient, id, currentStatus) => {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient
        .from('project_renders')
        .update({ is_overview: !currentStatus })
        .eq('id', id);
      
      if (!error) {
        set((state) => ({
          customRenders: state.customRenders.map(r => r.id === id ? { ...r, is_overview: !currentStatus } : r)
        }));
      }
    } catch (e) {
      console.error('Toggle Overview failed', e);
    }
  },
  updateOverviewOrder: async (supabaseClient, id, newOrder) => {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient
        .from('project_renders')
        .update({ overview_order: newOrder })
        .eq('id', id);
      
      if (!error) {
        set((state) => ({
          customRenders: state.customRenders.map(r => r.id === id ? { ...r, overview_order: newOrder } : r)
        }));
      }
    } catch (e) {
      console.error('Update Overview Order failed', e);
    }
  },
  renameFolder: async (supabaseClient, oldName, newName) => {
    if (!supabaseClient || !oldName || !newName || oldName === newName) return;
    try {
      const { error } = await supabaseClient
        .from('project_renders')
        .update({ folder_name: newName })
        .eq('folder_name', oldName);
      
      if (!error) {
        set((state) => ({
          customRenders: state.customRenders.map(r => r.folder_name === oldName ? { ...r, folder_name: newName } : r)
        }));
      }
    } catch (e) {
      console.error('Rename folder failed', e);
    }
  },
  updateFolderOrder: async (supabaseClient, folderName, newOrder) => {
    if (!supabaseClient || !folderName) return;
    try {
      const { error } = await supabaseClient
        .from('project_renders')
        .update({ folder_order: newOrder })
        .eq('folder_name', folderName);
      
      if (!error) {
        set((state) => ({
          customRenders: state.customRenders.map(r => r.folder_name === folderName ? { ...r, folder_order: newOrder } : r)
        }));
      }
    } catch (e) {
      console.error('Update folder order failed', e);
    }
  },
  updateFolderOrdersBatch: async (supabaseClient, folderMap) => {
    // folderMap is an object: { 'Interiors': 0, 'Exteriors': 1 }
    if (!supabaseClient) return;
    
    // 1. Optimistic UI update instantly
    set((state) => ({
      customRenders: state.customRenders.map(r => {
        if (r.folder_name && folderMap[r.folder_name] !== undefined) {
          return { ...r, folder_order: folderMap[r.folder_name] };
        }
        return r;
      })
    }));

    // 2. Background database sync
    try {
      for (const [folderName, newOrder] of Object.entries(folderMap)) {
        await supabaseClient
          .from('project_renders')
          .update({ folder_order: newOrder })
          .eq('folder_name', folderName);
      }
    } catch (e) {
      console.error('Batch update folder orders failed', e);
    }
  },
  moveRender: async (supabaseClient, id, newFolderName) => {
    if (!supabaseClient || !newFolderName) return;
    try {
      const { error } = await supabaseClient
        .from('project_renders')
        .update({ folder_name: newFolderName })
        .eq('id', id);
      
      if (!error) {
        set((state) => ({
          customRenders: state.customRenders.map(r => r.id === id ? { ...r, folder_name: newFolderName } : r)
        }));
      }
    } catch (e) {
      console.error('Move render failed', e);
    }
  },
  deleteRender: async (supabaseClient, id) => {
    if (!supabaseClient || !id) return;
    try {
      const { error } = await supabaseClient.from('project_renders').delete().eq('id', id);
      if (!error) {
        set((state) => ({
          customRenders: state.customRenders.filter(r => r.id !== id)
        }));
      }
    } catch (e) {
      console.error('Delete render failed', e);
    }
  },
  deleteFolder: async (supabaseClient, folderName) => {
    if (!supabaseClient || !folderName) return;
    
    // Optimistic UI update
    set((state) => ({
      customRenders: state.customRenders.filter(r => r.folder_name !== folderName)
    }));
    
    try {
      await supabaseClient.from('project_renders').delete().eq('folder_name', folderName);
    } catch (e) {
      console.error('Delete folder failed', e);
    }
  },
  deleteFloorplan: async (supabaseClient, id) => {
    if (!supabaseClient || !id) return;
    try {
      const { error } = await supabaseClient.from('project_floorplans').delete().eq('id', id);
      if (!error) {
        set((state) => ({
          customFloorplans: state.customFloorplans.filter(f => f.id !== id),
          activeFloorplanId: state.activeFloorplanId === id 
            ? (state.customFloorplans.find(f => f.id !== id)?.id || null) 
            : state.activeFloorplanId
        }));
      }
    } catch (e) {
      console.error('Delete floorplan failed', e);
    }
  },

  // Cinematic Videos
  customVideos: [],
  addCustomVideo: (videoObj) => set((state) => ({ customVideos: [...state.customVideos, videoObj] })),
  updateVideoOrdersBatch: async (supabaseClient, videoMap) => {
    // videoMap is an object: { [video_id]: new_order_index }
    if (!supabaseClient) return;
    
    // 1. Optimistic UI update instantly
    set((state) => ({
      customVideos: (state.customVideos || []).map(v => {
        if (v.id && videoMap[v.id] !== undefined) {
          return { ...v, order_index: videoMap[v.id] };
        }
        return v;
      })
    }));

    // 2. Background database sync
    try {
      for (const [id, newOrder] of Object.entries(videoMap)) {
        await supabaseClient
          .from('project_videos')
          .update({ order_index: newOrder })
          .eq('id', id);
      }
    } catch (e) {
      console.error('Batch update video orders failed', e);
    }
  },
  deleteVideo: async (supabaseClient, id) => {
    if (!supabaseClient || !id) return;
    try {
      const { error } = await supabaseClient.from('project_videos').delete().eq('id', id);
      if (!error) {
        set((state) => ({
          customVideos: state.customVideos.filter(v => v.id !== id)
        }));
      }
    } catch (e) {
      console.error('Delete video failed', e);
    }
  },
  updateVideoOrder: async (supabaseClient, id, newOrder) => {
    if (!supabaseClient) return;
    try {
      const { error } = await supabaseClient.from('project_videos').update({ order_index: newOrder }).eq('id', id);
      if (!error) {
        set((state) => ({
          customVideos: state.customVideos.map(v => v.id === id ? { ...v, order_index: newOrder } : v)
        }));
      }
    } catch (e) {
      console.error('Update video order failed', e);
    }
  },

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

      // Fetch Multi-Layer Floorplans
      const { data: floorplanData, error: floorplanError } = await supabaseClient
        .from('project_floorplans')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (!floorplanError && floorplanData && floorplanData.length > 0) {
        set({ customFloorplans: floorplanData });
        if (floorplanData.length > 0) {
            set({ activeFloorplanId: floorplanData[0].id });
        }
      } else if (data) {
        // Fallback to legacy single floorplan
        const singleFloorplan = data.find(d => d.asset_type === 'floorplan');
        if (singleFloorplan) {
            set({ customFloorplan: singleFloorplan.asset_url });
        }
      }

      // Fetch Cinematic Videos
      const { data: videoData, error: videoError } = await supabaseClient
        .from('project_videos')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });
        
      if (!videoError && videoData) {
        set({ customVideos: videoData });
      }

      // Fetch Config State (GPS, Lighting, etc)
      const { data: configData, error: configError } = await supabaseClient
        .from('properties_config')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (!configError && configData) {
        if (configData.title) set({ projectTitle: configData.title });
        if (configData.company_name) set({ companyName: configData.company_name });
        if (configData.project_description) set({ projectDescription: configData.project_description });
        if (configData.logo_url) set({ logoUrl: configData.logo_url });
        if (configData.overview_media_type) set({ overviewMediaType: configData.overview_media_type });
        if (configData.overview_video_url) set({ overviewVideoUrl: configData.overview_video_url });
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
