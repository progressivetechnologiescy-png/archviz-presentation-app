import React, { useCallback, useState, useEffect } from 'react';
import { UploadCloud, FileType, CheckCircle, MapPin, X } from 'lucide-react';
import { useViewerStore } from '../store/viewerStore';

function FileInput({ label, accept, onDrop, isUploaded, multiple = false, onClear }) {
  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      if (multiple) {
        onDrop(Array.from(e.target.files));
      } else {
        onDrop(e.target.files[0]);
      }
    }
  };

  return (
    <div className="hover-lift" style={{
      border: `2px dashed ${isUploaded ? 'var(--accent-color)' : 'var(--border-glass)'}`,
      borderRadius: '16px', padding: '24px', textAlign: 'center',
      background: isUploaded ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
      position: 'relative', overflow: 'hidden', cursor: 'pointer',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
    }}>
      <input 
        type="file" accept={accept} multiple={multiple}
        onChange={handleChange}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', pointerEvents: 'none' }}>
        {isUploaded ? <CheckCircle color="var(--accent-color)" size={32} /> : <UploadCloud size={32} color="var(--text-secondary)" />}
        <div>
          <h4 style={{ margin: '0 0 4px 0' }}>{label}</h4>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
            {isUploaded ? 'Loaded' : `Drop ${accept}`}
          </p>
        </div>
      </div>
      
      {isUploaded && onClear && (
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear();
          }}
          style={{ 
            position: 'absolute', top: '12px', right: '12px', 
            background: 'rgba(255,50,50,0.2)', color: '#ff6b6b', 
            border: 'none', borderRadius: '50%', width: '28px', height: '28px', 
            cursor: 'pointer', pointerEvents: 'auto', fontWeight: 'bold',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          title="Remove Asset"
        >
          ×
        </button>
      )}
    </div>
  );
}

import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

function extractYoutubeId(url) {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function extractYoutubeThumb(url) {
  const videoId = extractYoutubeId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return null;
}

function convertToEmbedUrl(url) {
  const videoId = extractYoutubeId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

export default function AssetManager() {
  const { 
    projectTitle, setProjectTitle, companyName, setCompanyName, projectDescription, setProjectDescription, logoUrl, overviewMediaType, overviewVideoUrl, setOverviewVideoUrl, updateBrandingConfig,
    customFBX, setCustomFBX, 
    customGLB, setCustomGLB,
    customUSDZ, setCustomUSDZ,
    customFloorplan, setCustomFloorplan, 
    customPanorama, setCustomPanorama, 
    customRenders, addCustomRender, clearCustomRenders,
    customGPS, setCustomGPS,
    geminiApiKey, setGeminiApiKey,
    aiContext, setAiContext,
    modelRoughness, modelMetalness, modelEnvMapIntensity, setModelProperties
  } = useViewerStore();


  const [gpsInput, setGpsInput] = useState(customGPS || '');
  const [isUploading, setIsUploading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' });
  const [pendingVideoThumb, setPendingVideoThumb] = useState(null);
  const [draggedFolderId, setDraggedFolderId] = useState(null);
  const [dragOverFolderId, setDragOverFolderId] = useState(null);

  const handleUploadVideoThumb = async (file) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `video_thumbs/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('archviz_models').upload(filePath, file);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('archviz_models').getPublicUrl(filePath);
        setPendingVideoThumb(publicUrl);
      } else {
        console.error('Video thumb upload error:', uploadError);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadLogo = async (file) => {
    if (!supabase) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${uuidv4()}.${fileExt}`;
      const filePath = `branding/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('archviz_models').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('archviz_models').getPublicUrl(filePath);
      updateBrandingConfig(supabase, { logoUrl: publicUrl });
    } catch (e) {
      console.error(e);
      alert("Failed to upload logo.");
    } finally {
      setIsUploading(false);
    }
  };

  // Initialize folder list from existing database renders
  const [folderList, setFolderList] = useState([]);
  
  useEffect(() => {
    const orderMap = {};
    (customRenders || []).forEach(r => {
      if (r.folder_name) {
        orderMap[r.folder_name] = Number(r.folder_order) || 0;
      }
    });
    
    const existing = (customRenders || []).map(r => r.folder_name).filter(Boolean);
    const uniqueFolders = [...new Set(['Interiors', 'Exteriors', ...existing])];
    
    // Add any locally added folders that haven't been saved to DB yet
    setFolderList(prev => {
      const localExtras = prev.filter(f => !uniqueFolders.includes(f));
      const merged = [...new Set([...uniqueFolders, ...localExtras])].sort((a, b) => {
        return (orderMap[a] || 0) - (orderMap[b] || 0);
      });
      if (JSON.stringify(merged) !== JSON.stringify(prev)) {
        return merged;
      }
      return prev;
    });
  }, [customRenders]);

  const handleFolderDrop = async (e, targetFolder) => {
    const draggedFolder = e.dataTransfer.getData('text/plain');
    if (draggedFolder === targetFolder || !draggedFolder) return;
    
    setFolderList(prev => {
      const newList = [...prev];
      const dragIdx = newList.indexOf(draggedFolder);
      const dropIdx = newList.indexOf(targetFolder);
      newList.splice(dragIdx, 1);
      newList.splice(dropIdx, 0, draggedFolder);
      
      if (supabase) {
        newList.forEach((folder, idx) => {
          useViewerStore.getState().updateFolderOrder(supabase, folder, idx);
        });
      }
      return newList;
    });
  };

  const [selectedFolder, setSelectedFolder] = useState('Interiors');

  // Sync the form field if Cloud DB fetches the GPS late
  useEffect(() => {
    if (customGPS && customGPS !== 'Beverly Hills, CA') {
      setGpsInput(customGPS);
    }
  }, [customGPS]);

  const uploadSingleFile = async (file, assetType, setLocalUpdate) => {
    if (!supabase) {
      alert("Database offline. Using local RAM.");
      setLocalUpdate(URL.createObjectURL(file));
      return;
    }
    setIsUploading(true);
    try {
      // 1. Fetch existing asset to clean up its physical file later
      const { data: oldAssets } = await supabase.from('presentation_assets')
        .select('asset_url')
        .match({ project_id: 'demo_project', asset_type: assetType });

      // 2. Upload using pure unique UUID to bypass strict UPSERT security policies
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `demo_project/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('archviz_models').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('archviz_models').getPublicUrl(filePath);

      // 3. Delete old physical files from the storage bucket to save space!
      if (oldAssets && oldAssets.length > 0) {
        for (const asset of oldAssets) {
          try {
             // Extract relative path from the public URL
             const oldPath = asset.asset_url.split('/archviz_models/')[1]?.split('?')[0];
             if (oldPath) await supabase.storage.from('archviz_models').remove([oldPath]);
          } catch (e) {
             console.warn("Could not delete old physical file", e);
          }
        }
      }

      // 4. Clean out old database rows
      try {
        await supabase.from('presentation_assets').delete().match({ project_id: 'demo_project', asset_type: assetType });
      } catch (delErr) {
        console.warn("Delete policy blocked old asset removal, proceeding with insert anyway.");
      }

      // 5. Insert new database row
      const { error: dbError } = await supabase.from('presentation_assets').insert({
        project_id: 'demo_project', asset_type: assetType, asset_url: publicUrl
      });
      if (dbError) throw dbError;

      setLocalUpdate(publicUrl);
      alert(`Successfully uploaded ${assetType} to Cloud Database!`);
    } catch (error) {
      console.error(`Upload error for ${assetType}:`, error);
      alert(`Upload Failed: ${error.message || JSON.stringify(error)}\n\n(If this says 'new row violates row-level security', you need an INSERT/UPDATE policy in Supabase!)`);
    } finally {
      setIsUploading(false);
    }
  };

  const clearAsset = async (assetType, setter) => {
    if (!supabase) {
      setter(null);
      return;
    }
    try {
      await supabase.from('presentation_assets').delete().match({ project_id: 'demo_project', asset_type: assetType });
      setter(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUploadFBX = (file) => uploadSingleFile(file, '3d_model_fbx', setCustomFBX);
  const handleUploadGLB = (file) => uploadSingleFile(file, '3d_model_glb', setCustomGLB);
  const handleUploadUSDZ = (file) => uploadSingleFile(file, '3d_model_usdz', setCustomUSDZ);
  const handleUploadFloorplan = (file) => uploadSingleFile(file, 'floorplan', setCustomFloorplan);
  const handleUploadPanorama = (file) => uploadSingleFile(file, 'panorama', setCustomPanorama);
  
  const handleUploadRenders = async (files) => {
    if (!supabase) {
      alert("Database offline. Using local RAM.");
      files.forEach(f => addCustomRender(URL.createObjectURL(f)));
      return;
    }
    setIsUploading(true);
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `renders/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('archviz_models').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('archviz_models').getPublicUrl(filePath);

        const { error: dbError } = await supabase.from('presentation_assets').insert({
          project_id: 'demo_project', asset_type: 'render', asset_url: publicUrl
        });
        if (dbError) throw dbError;

        addCustomRender(publicUrl);
      }
      alert(`Successfully uploaded ${files.length} renders to the Cloud Database!`);
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Render Upload Failed: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveGPS = async () => {
    let inputStr = gpsInput.trim();
    
    // If the user pastes an entire <iframe> code from Google Maps, extract just the src URL
    const iframeMatch = inputStr.match(/<iframe.*?src=["'](.*?)["']/i);
    if (iframeMatch) {
      inputStr = iframeMatch[1];
    }

    if (inputStr.match(/^https?:\/\//i)) {
      if (!inputStr.includes('google.com/maps/embed') && !inputStr.includes('maps.google.com/maps?q=')) {
        alert("To use a URL, you must use the 'Embed a map' link from Google Maps (or the <iframe> code). Standard share links like 'maps.app.goo.gl' cannot be embedded due to Google's security rules.\n\nAlternatively, just type the physical address text here!");
        return;
      }
    }

    setCustomGPS(inputStr);
    if (supabase) {
      const { error } = await supabase
        .from('properties_config')
        .upsert({
          project_id: 'demo_project',
          title: 'The Pinnacle Residence',
          gps_coordinates: gpsInput
        });
      
      if (error) {
        console.error("Failed to save GPS:", error);
        alert("Failed to save location to the Cloud. (Check if you ran the SQL policy for properties_config!)");
      } else {
        alert("Location Saved to Cloud DB!");
      }
    }
  };

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ padding: '80px 32px 32px', height: '100%', overflowY: 'auto' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '64px' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '8px', fontSize: '32px', fontWeight: '300' }}>Presentation CMS</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Manage all content, 3D assets, and interactive configurations for this presentation.
          </p>
        </div>

        <style>{`
          .cms-layout { display: flex; gap: 32px; align-items: flex-start; }
          .cms-sidebar { width: 240px; flex-shrink: 0; position: sticky; top: 80px; display: flex; flex-direction: column; gap: 8px; }
          .cms-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 24px; }
          
          @media (max-width: 768px) {
            .cms-layout { flex-direction: column; gap: 24px; }
            .cms-sidebar { width: 100%; position: static; flex-direction: row; overflow-x: auto; padding-bottom: 16px; border-bottom: 1px solid var(--border-glass); }
          }
        `}</style>
        
        <div className="cms-layout">
          {/* Sidebar Menu */}
          <div className="cms-sidebar">
            {['overview', 'models', 'renders', 'cinematics', 'floorplans', 'tours', 'availability', 'ai_settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="hover-lift"
                style={{
                  padding: '14px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'left',
                  background: activeTab === tab ? 'var(--accent-color)' : 'rgba(0,0,0,0.2)',
                  color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                  border: activeTab === tab ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border-glass)', 
                  transition: 'all 0.2s', whiteSpace: 'nowrap'
                }}
              >
                {tab === 'overview' && 'Overview & Branding'}
                {tab === 'models' && '3D Models & Scene'}
                {tab === 'renders' && 'Render Gallery'}
                {tab === 'cinematics' && 'Videos'}
                {tab === 'floorplans' && 'Floorplans'}
                {tab === 'tours' && '360° Tours'}
                {tab === 'availability' && 'Availability Grid'}
                {tab === 'ai_settings' && 'Emma AI Settings'}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="cms-content">

          {/* TAB: OVERVIEW & BRANDING */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px' }}>Project Identity</h3>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Project Title</label>
                    <input 
                      type="text" 
                      value={projectTitle || ''}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      onBlur={(e) => updateBrandingConfig(supabase, { projectTitle: e.target.value })}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', fontFamily: 'inherit', fontSize: '15px' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Company Name</label>
                    <input 
                      type="text" 
                      value={companyName || ''}
                      onChange={(e) => setCompanyName(e.target.value)}
                      onBlur={(e) => updateBrandingConfig(supabase, { companyName: e.target.value })}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', fontFamily: 'inherit', fontSize: '15px' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Overview Description</label>
                    <textarea 
                      value={projectDescription || ''}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      onBlur={(e) => updateBrandingConfig(supabase, { projectDescription: e.target.value })}
                      rows={4}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: '15px', lineHeight: '1.5' }} 
                    />
                  </div>
                </div>
                <div style={{ flex: '0 0 200px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '20px' }}>Logo</h3>
                  <FileInput 
                    label="Upload Logo" 
                    accept="image/*" 
                    onDrop={handleUploadLogo} 
                    isUploaded={!!logoUrl} 
                    onClear={() => updateBrandingConfig(supabase, { logoUrl: null })}
                  />
                  {logoUrl && (
                    <div style={{ marginTop: '16px', background: 'white', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                      <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain' }} />
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '20px' }}>Overview Background Media</h3>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <button 
                    onClick={() => updateBrandingConfig(supabase, { overviewMediaType: 'images' })}
                    style={{ flex: 1, padding: '16px', borderRadius: '8px', border: overviewMediaType === 'images' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)', background: overviewMediaType === 'images' ? 'rgba(255, 107, 0, 0.1)' : 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Image Slideshow</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Uses starred images from the Render Gallery</div>
                  </button>
                  <button 
                    onClick={() => updateBrandingConfig(supabase, { overviewMediaType: 'video' })}
                    style={{ flex: 1, padding: '16px', borderRadius: '8px', border: overviewMediaType === 'video' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)', background: overviewMediaType === 'video' ? 'rgba(255, 107, 0, 0.1)' : 'rgba(0,0,0,0.2)', color: 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Background Video</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Plays a silent YouTube loop</div>
                  </button>
                </div>

                {overviewMediaType === 'video' && (
                    <div style={{ marginTop: '16px', animation: 'fadeIn 0.3s ease-out' }}>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>YouTube Video Link (Background)</label>
                      <input 
                        type="text" 
                        value={overviewVideoUrl || ''}
                        onChange={(e) => setOverviewVideoUrl(e.target.value)}
                        onBlur={(e) => {
                          const url = e.target.value.trim();
                          const finalUrl = url ? convertToEmbedUrl(url) : '';
                          setOverviewVideoUrl(finalUrl);
                          updateBrandingConfig(supabase, { overviewVideoUrl: finalUrl });
                        }}
                        placeholder="https://youtu.be/..."
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', fontFamily: 'inherit', fontSize: '15px' }} 
                      />
                    {overviewVideoUrl && (
                      <div style={{ marginTop: '16px', width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden' }}>
                        <iframe 
                          src={`${overviewVideoUrl}?autoplay=1&mute=1&controls=0&loop=1&playlist=${extractYoutubeId(overviewVideoUrl)}`} 
                          style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* TAB: 3D MODELS */}
          {activeTab === 'models' && (
            <>
              <FileInput 
                label="Original 3D Model (FBX)" 
                accept=".fbx" 
                onDrop={handleUploadFBX} 
                isUploaded={!!customFBX} 
                onClear={() => clearAsset('3d_model_fbx', setCustomFBX)}
              />
              <FileInput 
                label="WebGL Optimized Model (GLB/GLTF)" 
                accept=".glb,.gltf" 
                onDrop={handleUploadGLB} 
                isUploaded={!!customGLB} 
                onClear={() => clearAsset('3d_model_glb', setCustomGLB)}
              />
              <FileInput 
                label="Apple AR Model (USDZ)" 
                accept=".usdz" 
                onDrop={handleUploadUSDZ} 
                isUploaded={!!customUSDZ} 
                onClear={() => clearAsset('3d_model_usdz', setCustomUSDZ)}
              />
              <div className="hover-lift" style={{ border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '24px', background: 'var(--bg-panel)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <MapPin size={24} color="var(--text-secondary)" />
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>Real-World Address</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Used for AI Radar location context.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={gpsInput} onChange={(e) => setGpsInput(e.target.value)} placeholder="e.g., 'Limassol, Cyprus'" style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }} />
                  <button onClick={handleSaveGPS} style={{ padding: '12px 24px', borderRadius: '8px', background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Save Location</button>
                </div>
              </div>
            </>
          )}

          {/* TAB: RENDERS */}
          {activeTab === 'renders' && (
            <>
              <div className="hover-lift" style={{ border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '24px', background: 'var(--bg-panel)' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Render Folders</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    id="newFolderName"
                    placeholder="e.g. 'Living Room' or 'Exteriors'"
                    style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('newFolderName');
                      if (input.value.trim()) {
                        setFolderList([...folderList, input.value.trim()]);
                        setSelectedFolder(input.value.trim());
                        input.value = '';
                      }
                    }}
                    style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Add Folder
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {folderList.map(folder => (
                    <div 
                      key={folder}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', folder);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedFolderId(folder);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverFolderId !== folder) setDragOverFolderId(folder);
                      }}
                      onDragLeave={() => {
                        if (dragOverFolderId === folder) setDragOverFolderId(null);
                      }}
                      onDragEnd={() => {
                        setDraggedFolderId(null);
                        setDragOverFolderId(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDraggedFolderId(null);
                        setDragOverFolderId(null);
                        handleFolderDrop(e, folder);
                      }}
                      onClick={() => setSelectedFolder(folder)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'grab',
                        border: selectedFolder === folder ? '1px solid var(--accent-color)' : (dragOverFolderId === folder ? '1px dashed var(--accent-color)' : '1px solid rgba(255,255,255,0.1)'),
                        background: dragOverFolderId === folder ? 'rgba(255, 107, 0, 0.3)' : (selectedFolder === folder ? 'rgba(255, 107, 0, 0.15)' : 'rgba(0,0,0,0.2)'),
                        color: selectedFolder === folder ? 'var(--accent-color)' : 'var(--text-secondary)',
                        opacity: draggedFolderId === folder ? 0.4 : 1,
                        transform: dragOverFolderId === folder && draggedFolderId !== folder ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.2s', userSelect: 'none'
                      }}
                      title="Drag to reorder"
                    >
                      <span style={{ opacity: 0.5, fontSize: '14px', cursor: 'grab' }}>⋮⋮</span>
                      {folder}
                    </div>
                  ))}
                </div>

                {selectedFolder && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, color: 'var(--text-secondary)' }}>Rename Folder:</h4>
                      <input 
                        key={`rename-${selectedFolder}`}
                        type="text" 
                        defaultValue={selectedFolder}
                        onBlur={(e) => {
                          const newName = e.target.value.trim();
                          if (newName && newName !== selectedFolder) {
                            useViewerStore.getState().renameFolder(supabase, selectedFolder, newName);
                            setFolderList(folderList.map(f => f === selectedFolder ? newName : f));
                            setSelectedFolder(newName);
                          }
                        }}
                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'white', padding: '4px 0', fontSize: '16px', fontWeight: 'bold' }}
                      />
                    </div>
                    
                    
                    <div style={{ flex: 1 }} />

                    <button
                      onClick={() => {
                        const folderRenders = useViewerStore.getState().customRenders?.filter(r => r.folder_name === selectedFolder) || [];
                        if (folderRenders.length > 0) {
                          setAlertModal({ 
                            isOpen: true, 
                            message: `You cannot delete "${selectedFolder}" because it still contains ${folderRenders.length} images.\n\nPlease delete or move all images out of this folder first.`
                          });
                          return;
                        }
                        
                        setConfirmModal({
                          isOpen: true,
                          message: `Are you sure you want to delete the empty folder "${selectedFolder}"?`,
                          onConfirm: () => {
                            useViewerStore.getState().deleteFolder(supabase, selectedFolder);
                            // Switch to a different folder visually
                            setFolderList(prev => {
                              const newList = prev.filter(f => f !== selectedFolder);
                              setSelectedFolder(newList.length > 0 ? newList[0] : null);
                              return newList;
                            });
                          }
                        });
                      }}
                      style={{
                        padding: '8px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                        border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                    >
                      <X size={16} /> Delete Empty Folder
                    </button>
                  </div>
                )}
              </div>

              <div style={{ position: 'relative', opacity: selectedFolder ? 1 : 0.5, pointerEvents: selectedFolder ? 'auto' : 'none' }}>
                {!selectedFolder && (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                    <span style={{ background: 'rgba(0,0,0,0.8)', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold' }}>Please select a folder first</span>
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                  {/* Upload Box */}
                  <FileInput 
                    label={`Upload to '${selectedFolder || '...'}'`} 
                    accept="image/*" 
                    multiple={true}
                    onDrop={async (files) => {
                      if (!supabase) {
                        files.forEach(f => addCustomRender({ id: uuidv4(), folder_name: selectedFolder, image_url: URL.createObjectURL(f), is_overview: false }));
                        return;
                      }
                      setIsUploading(true);
                      try {
                        for (const file of files) {
                          const fileExt = file.name.split('.').pop();
                          const fileName = `${uuidv4()}.${fileExt}`;
                          const filePath = `renders/${fileName}`;
                          
                          const { error: uploadError } = await supabase.storage.from('archviz_models').upload(filePath, file);
                          if (uploadError) throw uploadError;
                          
                          const { data: { publicUrl } } = supabase.storage.from('archviz_models').getPublicUrl(filePath);
                          
                          const newRow = { project_id: 'demo_project', folder_name: selectedFolder, image_url: publicUrl, is_overview: false };
                          const { data: dbData, error: dbError } = await supabase.from('project_renders').insert(newRow).select().single();
                          if (dbError) throw dbError;
                          
                          addCustomRender(dbData);
                        }
                        alert(`Successfully uploaded ${files.length} renders to '${selectedFolder}'!`);
                      } catch (error) {
                        console.error("Upload error:", error);
                        alert(`Render Upload Failed: ${error.message}`);
                      } finally {
                        setIsUploading(false);
                      }
                    }} 
                    isUploaded={false} // Never show checkmark for multi-upload, always allow more
                  />

                  {/* Thumbnail Grid for Selected Folder */}
                  {selectedFolder && customRenders && customRenders.filter(r => r.folder_name === selectedFolder).length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', marginTop: '16px' }}>
                      {customRenders.filter(r => r.folder_name === selectedFolder).map(render => (
                        <div key={render.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '100px', border: render.is_overview ? '2px solid var(--accent-color)' : 'none' }}>
                          <img src={render.image_url} alt="render thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            onClick={() => useViewerStore.getState().toggleOverviewRender(supabase, render.id, render.is_overview)}
                            title={render.is_overview ? "Remove from Overview Slideshow" : "Add to Overview Slideshow"}
                            style={{
                              position: 'absolute', top: '8px', right: '8px',
                              background: render.is_overview ? 'var(--accent-color)' : 'rgba(0,0,0,0.5)',
                              color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%',
                              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.2s', fontSize: '16px', zIndex: 2
                            }}
                          >
                            ★
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModal({
                                isOpen: true,
                                message: 'Are you sure you want to delete this render?',
                                onConfirm: () => useViewerStore.getState().deleteRender(supabase, render.id)
                              });
                            }}
                            title="Delete Render"
                            style={{
                              position: 'absolute', top: '8px', right: '48px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              backdropFilter: 'blur(4px)',
                              color: '#ef4444', 
                              border: '1px solid rgba(239, 68, 68, 0.4)', 
                              borderRadius: '50%',
                              width: '32px', height: '32px', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.2s', zIndex: 2, outline: 'none'
                            }}
                            onMouseEnter={(e) => {
                               e.currentTarget.style.background = '#ef4444';
                               e.currentTarget.style.color = 'white';
                               e.currentTarget.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                               e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                               e.currentTarget.style.color = '#ef4444';
                               e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <X size={16} />
                          </button>
                          {render.is_overview && (
                            <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', borderRadius: '4px', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Order:</span>
                              <input 
                                type="number" 
                                defaultValue={render.overview_order || 0}
                                onBlur={(e) => useViewerStore.getState().updateOverviewOrder(supabase, render.id, parseInt(e.target.value) || 0)}
                                style={{ width: '32px', background: 'transparent', border: 'none', borderBottom: '1px solid white', color: 'white', fontSize: '12px', textAlign: 'center' }}
                              />
                            </div>
                          )}
                          <select
                            value={render.folder_name}
                            onChange={(e) => useViewerStore.getState().moveRender(supabase, render.id, e.target.value)}
                            style={{ position: 'absolute', bottom: '8px', left: '8px', width: 'calc(100% - 16px)', background: 'rgba(0,0,0,0.8)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', fontSize: '10px', padding: '4px', zIndex: 2 }}
                          >
                            {folderList.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB: CINEMATICS */}
          {activeTab === 'cinematics' && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Cinematic Videos</h3>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input id="new-video-title" type="text" placeholder="Video Title (e.g. Drone Flyover)" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} />
                  <input id="new-video-url" type="text" placeholder="YouTube Embed URL (e.g. https://www.youtube.com/embed/...)" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }} />
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <FileInput 
                        label="Upload Custom Thumbnail (Optional)" 
                        accept="image/*" 
                        onDrop={handleUploadVideoThumb} 
                        isUploaded={!!pendingVideoThumb} 
                      />
                    </div>
                    {pendingVideoThumb && (
                      <div style={{ position: 'relative', width: '120px', height: '68px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={pendingVideoThumb} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          onClick={() => setPendingVideoThumb(null)} 
                          style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', cursor: 'pointer' }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    const title = document.getElementById('new-video-title').value.trim();
                    const url = document.getElementById('new-video-url').value.trim();
                    if (!title || !url) {
                      alert('Title and Video URL are required.');
                      return;
                    }
                    
                    let finalThumb = pendingVideoThumb;
                    if (!finalThumb) {
                       finalThumb = extractYoutubeThumb(url) || '';
                    }
                    
                    const finalUrl = convertToEmbedUrl(url);

                    const newVideo = { project_id: 'demo_project', title, video_url: finalUrl, thumbnail_url: finalThumb, order_index: useViewerStore.getState().customVideos?.length || 0 };
                    const { data, error } = await supabase.from('project_videos').insert([newVideo]).select();
                    if (!error && data) {
                      useViewerStore.getState().addCustomVideo(data[0]);
                      document.getElementById('new-video-title').value = '';
                      document.getElementById('new-video-url').value = '';
                      setPendingVideoThumb(null);
                    } else {
                      console.error('Failed to add video:', error);
                    }
                  }}
                  className="hover-lift"
                  style={{ padding: '12px 24px', borderRadius: '8px', background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', height: 'fit-content' }}>
                  {isUploading ? 'Uploading...' : '+ Add Video'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[...(useViewerStore.getState().customVideos || [])]
                  .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                  .map((video) => (
                  <div 
                    key={video.id} 
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', video.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedId = e.dataTransfer.getData('text/plain');
                      if (draggedId === video.id) return;
                      
                      const videos = [...(useViewerStore.getState().customVideos || [])].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
                      const draggedIndex = videos.findIndex(v => v.id === draggedId);
                      const targetIndex = videos.findIndex(v => v.id === video.id);
                      
                      if (draggedIndex > -1 && targetIndex > -1) {
                        const [draggedItem] = videos.splice(draggedIndex, 1);
                        videos.splice(targetIndex, 0, draggedItem);
                        
                        const videoMap = {};
                        videos.forEach((v, index) => {
                          videoMap[v.id] = index;
                        });
                        
                        useViewerStore.getState().updateVideoOrdersBatch(supabase, videoMap);
                      }
                    }}
                    style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', alignItems: 'center', cursor: 'grab' }}
                  >
                    <div style={{ width: '120px', height: '68px', background: 'black', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                      {video.thumbnail_url ? (
                        <img src={video.thumbnail_url} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}>
                          <span style={{ fontSize: '10px', color: '#999' }}>No Thumb</span>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{video.title}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{video.video_url}</p>
                    </div>
                    <button
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          message: `Are you sure you want to delete the video "${video.title}"?`,
                          onConfirm: () => useViewerStore.getState().deleteVideo(supabase, video.id)
                        });
                      }}
                      className="hover-lift"
                      style={{
                        padding: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', 
                        border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', cursor: 'pointer',
                        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
                {(!useViewerStore.getState().customVideos || useViewerStore.getState().customVideos.length === 0) && (
                  <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    No videos added yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: FLOORPLANS */}
          {activeTab === 'floorplans' && (() => {
            const floorplans = useViewerStore.getState().customFloorplans || [];
            const propertyTypes = [...new Set(floorplans.map(f => f.property_type || 'Default Property'))];
            if (propertyTypes.length === 0) propertyTypes.push('Default Property');
            
            // We use activeFolder state to represent active Property Block for simplicity, since it's only active in this tab.
            // Or we just map through propertyTypes and show them all as distinct blocks.
            return (
              <>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  <input 
                    type="text" 
                    id="newPropertyBlock"
                    placeholder="e.g. 'Block A' or 'Villa Type 2'"
                    style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById('newPropertyBlock');
                      if (input.value.trim()) {
                        // Adding a dummy floorplan just to create the group, or just relying on user uploading one.
                        // Actually, we can just use selectedFolder state!
                        setSelectedFolder(input.value.trim());
                        input.value = '';
                      }
                    }}
                    style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Create Property Block
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {Array.from(new Set([...propertyTypes, selectedFolder === 'All' ? 'Default Property' : selectedFolder])).map(type => (
                    <button 
                      key={type}
                      onClick={() => setSelectedFolder(type)}
                      style={{
                        padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                        border: selectedFolder === type ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)',
                        background: selectedFolder === type ? 'rgba(255, 107, 0, 0.15)' : 'rgba(0,0,0,0.2)',
                        color: selectedFolder === type ? 'var(--accent-color)' : 'var(--text-secondary)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                  <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-secondary)' }}>Upload to: <strong style={{color: 'white'}}>{selectedFolder === 'All' ? 'Default Property' : selectedFolder}</strong></h3>
                    <FileInput 
                      label={`Drop floorplans for ${selectedFolder === 'All' ? 'Default Property' : selectedFolder}`}
                      accept="image/*,.pdf" 
                      multiple={true}
                      onDrop={async (files) => {
                        const targetProperty = selectedFolder === 'All' ? 'Default Property' : selectedFolder;
                        if (!supabase) {
                          files.forEach((f, i) => useViewerStore.getState().addCustomFloorplan({ id: uuidv4(), property_type: targetProperty, level_name: `Level ${i+1}`, image_url: URL.createObjectURL(f), order_index: 0 }));
                          return;
                        }
                        setIsUploading(true);
                        try {
                          for (const file of files) {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${uuidv4()}.${fileExt}`;
                            const filePath = `floorplans/${fileName}`;
                            
                            const { error: uploadError } = await supabase.storage.from('archviz_models').upload(filePath, file);
                            if (uploadError) throw uploadError;
                            
                            const { data: { publicUrl } } = supabase.storage.from('archviz_models').getPublicUrl(filePath);
                            
                            const newRow = { project_id: 'demo_project', property_type: targetProperty, level_name: 'New Level', image_url: publicUrl, order_index: 0 };
                            const { data: dbData, error: dbError } = await supabase.from('project_floorplans').insert(newRow).select().single();
                            if (dbError) throw dbError;
                            
                            useViewerStore.getState().addCustomFloorplan(dbData);
                          }
                          setAlertModal({ isOpen: true, message: `Successfully uploaded ${files.length} floorplans to '${targetProperty}'!` });
                        } catch (error) {
                          console.error("Upload error:", error);
                          setAlertModal({ isOpen: true, message: `Floorplan Upload Failed: ${error.message}` });
                        } finally {
                          setIsUploading(false);
                        }
                      }} 
                      isUploaded={false}
                    />
                  </div>

                  {/* Floorplan List for Selected Property */}
                  {floorplans.filter(f => f.property_type === (selectedFolder === 'All' ? 'Default Property' : selectedFolder)).length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Manage Levels for {selectedFolder === 'All' ? 'Default Property' : selectedFolder}</h3>
                      {[...floorplans.filter(f => f.property_type === (selectedFolder === 'All' ? 'Default Property' : selectedFolder))]
                        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                        .map(plan => (
                        <div 
                          key={plan.id} 
                          className="glass-panel" 
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', plan.id);
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const draggedId = e.dataTransfer.getData('text/plain');
                            if (draggedId === plan.id) return;
                            
                            const plans = [...floorplans.filter(f => f.property_type === (selectedFolder === 'All' ? 'Default Property' : selectedFolder))].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
                            const draggedIndex = plans.findIndex(f => f.id === draggedId);
                            const targetIndex = plans.findIndex(f => f.id === plan.id);
                            
                            if (draggedIndex > -1 && targetIndex > -1) {
                              const [draggedItem] = plans.splice(draggedIndex, 1);
                              plans.splice(targetIndex, 0, draggedItem);
                              
                              const planMap = {};
                              plans.forEach((f, index) => {
                                planMap[f.id] = index;
                              });
                              
                              useViewerStore.getState().updateFloorplanOrdersBatch(supabase, planMap);
                            }
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', cursor: 'grab' }}
                        >
                          <div style={{ width: '80px', height: '60px', borderRadius: '8px', background: `url(${plan.image_url}) center/cover no-repeat rgba(255,255,255,0.05)`, border: '1px solid rgba(255,255,255,0.1)' }} />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Level Name (e.g. Ground Floor)</label>
                                <input 
                                  type="text" 
                                  defaultValue={plan.level_name}
                                  onBlur={(e) => {
                                    if (e.target.value.trim() !== plan.level_name) {
                                      useViewerStore.getState().updateFloorplanLabel(supabase, plan.id, e.target.value.trim());
                                    }
                                  }}
                                  style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', color: 'white', padding: '4px 0', fontSize: '16px', fontWeight: 'bold' }}
                                />
                              </div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Move to Block</label>
                                <select 
                                  value={plan.property_type || 'Default Property'}
                                  onChange={(e) => {
                                    useViewerStore.getState().updateFloorplanPropertyType(supabase, plan.id, e.target.value);
                                  }}
                                  style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white', padding: '6px', borderRadius: '6px' }}
                                >
                                  {Array.from(new Set([...propertyTypes, selectedFolder === 'All' ? 'Default Property' : selectedFolder])).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={async () => {
                              setConfirmModal({
                                isOpen: true,
                                message: `Are you sure you want to delete "${plan.level_name}"?`,
                                onConfirm: () => {
                                  useViewerStore.getState().deleteFloorplan(supabase, plan.id);
                                }
                              });
                            }}
                            className="hover-lift"
                            style={{ 
                              padding: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', 
                              border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', cursor: 'pointer',
                              backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s' 
                            }}
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          {/* TAB: TOURS */}
          {activeTab === 'tours' && (
            <>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--accent-color)', borderRadius: '12px', padding: '16px', marginBottom: '16px', color: 'white' }}>
                <strong>Module 3: Coming Soon!</strong> We will add a 360 Hotspot builder here.
              </div>
              <FileInput 
                label="360° Panorama Image (Equirectangular)" 
                accept="image/*" 
                onDrop={handleUploadPanorama} 
                isUploaded={!!customPanorama} 
                onClear={() => clearAsset('panorama', setCustomPanorama)}
              />
            </>
          )}

          {/* TAB: AVAILABILITY */}
          {activeTab === 'availability' && (
            <div className="hover-lift" style={{ border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '64px 24px', textAlign: 'center', background: 'var(--bg-panel)' }}>
              <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Availability Data Grid</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px' }}>
                Manage inventory, pricing, and live statuses here. This data will automatically sync with Emma AI.
              </p>
              <button style={{ padding: '12px 24px', borderRadius: '8px', background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                Build Module 4 Now
              </button>
            </div>
          )}

          {/* TAB: AI SETTINGS */}
          {activeTab === 'ai_settings' && (
            <div className="hover-lift" style={{ border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '24px', background: 'var(--bg-panel)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>E</div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>Emma AI Configuration</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Connect Emma to Google Gemini and provide property specifications.</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>GOOGLE GEMINI API KEY</label>
                  <input type="password" value={geminiApiKey || ''} onChange={(e) => setGeminiApiKey(e.target.value)} placeholder="AIzaSy..." style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>PROPERTY SPECIFICATIONS (CONTEXT)</label>
                  <textarea value={aiContext || ''} onChange={(e) => setAiContext(e.target.value)} placeholder="Paste pricing, square footage, materials..." style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', minHeight: '120px', resize: 'vertical', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white', fontFamily: 'inherit' }} />
                </div>
                <button 
                  onClick={async () => {
                    if (supabase) {
                      const { error } = await supabase.from('properties_config').update({ gemini_api_key: geminiApiKey, ai_context: aiContext }).match({ project_id: 'demo_project' });
                      if (error) alert(`Failed to save: ${error.message}`);
                      else alert("Emma AI Configuration Saved!");
                    }
                  }}
                  style={{ padding: '12px 24px', borderRadius: '8px', alignSelf: 'flex-start', background: 'white', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Save AI Settings
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{
            background: 'var(--bg-panel)', padding: '32px', borderRadius: '16px',
            width: '90%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0', color: 'white' }}>Confirm Action</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.5' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
                className="hover-lift"
                style={{ padding: '10px 24px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ isOpen: false, message: '', onConfirm: null });
                }}
                className="hover-lift"
                style={{ padding: '10px 24px', borderRadius: '8px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ALERT MODAL */}
      {alertModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{
            background: 'var(--bg-panel)', padding: '32px', borderRadius: '16px',
            width: '90%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)', textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px 0', color: 'white' }}>Notice</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{alertModal.message}</p>
            <button 
              onClick={() => setAlertModal({ isOpen: false, message: '' })}
              className="hover-lift"
              style={{ padding: '10px 32px', borderRadius: '8px', background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 12px var(--accent-glow)' }}
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
