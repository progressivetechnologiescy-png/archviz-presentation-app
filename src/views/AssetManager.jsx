import React, { useCallback, useState, useEffect } from 'react';
import { UploadCloud, FileType, CheckCircle, MapPin } from 'lucide-react';
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

export default function AssetManager() {
  const { 
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

  return (
    <div style={{ padding: '120px 32px 32px', height: '100%', overflowY: 'auto' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '64px' }}>
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '8px', fontSize: '28px', fontWeight: '300' }}>Session Asset Manager</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Upload files here to test them immediately in the viewer. 
            Because this is a serverless application, these assets are stored in temporary browser memory 
            for validation purposes.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
          
          <FileInput 
            label="High-Res Renders (Images)" 
            accept="image/*" 
            multiple={true}
            onDrop={handleUploadRenders} 
            isUploaded={customRenders.length > 0} 
            onClear={async () => {
              if (supabase) await supabase.from('presentation_assets').delete().match({ project_id: 'demo_project', asset_type: 'render' });
              clearCustomRenders();
            }}
          />
          
          <FileInput 
            label="360° Panorama Image (Equirectangular)" 
            accept="image/*" 
            onDrop={handleUploadPanorama} 
            isUploaded={!!customPanorama} 
            onClear={() => clearAsset('panorama', setCustomPanorama)}
          />
          
          <FileInput 
            label="2D Floorplan" 
            accept="image/*,.pdf" 
            onDrop={handleUploadFloorplan} 
            isUploaded={!!customFloorplan} 
            onClear={() => clearAsset('floorplan', setCustomFloorplan)}
          />
          
          {/* GPS Coordinate Text Input */}
          <div className="hover-lift" style={{
            border: '1px solid var(--border-glass)',
            borderRadius: '16px', padding: '24px',
            background: 'var(--bg-panel)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <MapPin size={24} color="var(--text-secondary)" />
              <div>
                <h4 style={{ margin: '0 0 4px 0' }}>Real-World Address</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Do not paste URLs! Just type the literal text address or city.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={gpsInput}
                onChange={(e) => setGpsInput(e.target.value)}
                placeholder="e.g., '123 Sunset Blvd, CA' or 'Empire State Building'"
                style={{ 
                  flex: 1, padding: '12px 16px', borderRadius: '8px',
                  background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white'
                }}
              />
              <button 
                onClick={handleSaveGPS}
                style={{ 
                  padding: '12px 24px', borderRadius: '8px', 
                  background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' 
                }}>
                Save Location
              </button>
            </div>
          </div>

          {/* AI Configuration Section */}
          <div className="hover-lift" style={{
            border: '1px solid var(--border-glass)',
            borderRadius: '16px', padding: '24px',
            background: 'var(--bg-panel)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>E</div>
              <div>
                <h4 style={{ margin: '0 0 4px 0' }}>Emma AI Configuration</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Connect Emma to Google Gemini and provide property specifications.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>GOOGLE GEMINI API KEY (FREE)</label>
                <input 
                  type="password" 
                  value={geminiApiKey || ''}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  style={{ 
                    width: '100%', padding: '12px 16px', borderRadius: '8px',
                    background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>PROPERTY SPECIFICATIONS (EMMA'S CONTEXT)</label>
                <textarea 
                  value={aiContext || ''}
                  onChange={(e) => setAiContext(e.target.value)}
                  placeholder="Paste pricing, square footage, materials, history, and any other details Emma should know..."
                  style={{ 
                    width: '100%', padding: '12px 16px', borderRadius: '8px', minHeight: '120px', resize: 'vertical',
                    background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white', fontFamily: 'inherit'
                  }}
                />
              </div>

              <button 
                onClick={async () => {
                  if (supabase) {
                    const { error } = await supabase.from('properties_config').upsert({
                      project_id: 'demo_project',
                      gemini_api_key: geminiApiKey,
                      ai_context: aiContext
                    });
                    if (error) {
                      console.error(error);
                      alert("Failed to save AI config to Cloud DB. Make sure you ran this in the Supabase SQL Editor:\n\nALTER TABLE properties_config ADD COLUMN gemini_api_key text;\nALTER TABLE properties_config ADD COLUMN ai_context text;");
                    } else {
                      alert("Emma AI Configuration Saved to Cloud!");
                    }
                  }
                }}
                style={{ 
                  padding: '12px 24px', borderRadius: '8px', alignSelf: 'flex-start',
                  background: 'white', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold' 
                }}>
                Save AI Settings
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
