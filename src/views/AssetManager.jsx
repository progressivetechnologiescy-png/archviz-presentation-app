import React, { useCallback, useState, useEffect } from 'react';
import { UploadCloud, FileType, CheckCircle, MapPin } from 'lucide-react';
import { useViewerStore } from '../store/viewerStore';

function FileInput({ label, accept, onDrop, isUploaded, multiple = false }) {
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
      const fileExt = file.name.split('.').pop();
      // Use deterministic filename to OVERWRITE old files and save space!
      const fileName = `${assetType}.${fileExt}`;
      const filePath = `demo_project/${fileName}`;

      // Upsert true overwrites the physical file in the bucket
      const { error: uploadError } = await supabase.storage.from('archviz_models').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      let { data: { publicUrl } } = supabase.storage.from('archviz_models').getPublicUrl(filePath);
      
      // Append a timestamp cache-buster so the browser doesn't load the old model!
      publicUrl = `${publicUrl}?v=${new Date().getTime()}`;

      // Try to clean out existing single-asset for this project, but don't crash if RLS blocks delete!
      try {
        await supabase.from('presentation_assets').delete().match({ project_id: 'demo_project', asset_type: assetType });
      } catch (delErr) {
        console.warn("Delete policy blocked old asset removal, proceeding with insert anyway.");
      }

      const { error: dbError } = await supabase.from('presentation_assets').insert({
        project_id: 'demo_project', asset_type: assetType, asset_url: publicUrl
      });
      if (dbError) throw dbError;

      setLocalUpdate(publicUrl);
      alert(`Successfully uploaded ${assetType} to Cloud Database!`);
    } catch (error) {
      console.error(`Upload error for ${assetType}:`, error);
      alert(`Failed to upload ${assetType}.`);
    } finally {
      setIsUploading(false);
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
      alert("Failed to upload renders.");
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
          />
          <FileInput 
            label="WebGL Optimized Model (GLB/GLTF)" 
            accept=".glb,.gltf" 
            onDrop={handleUploadGLB} 
            isUploaded={!!customGLB} 
          />
          <FileInput 
            label="Apple AR Model (USDZ)" 
            accept=".usdz" 
            onDrop={handleUploadUSDZ} 
            isUploaded={!!customUSDZ} 
          />
          
          <FileInput 
            label="High-Res Renders (Images)" 
            accept="image/*" 
            multiple={true}
            onDrop={handleUploadRenders} 
            isUploaded={customRenders.length > 0} 
          />
          
          <FileInput 
            label="360° Panorama Image (Equirectangular)" 
            accept="image/*" 
            onDrop={handleUploadPanorama} 
            isUploaded={!!customPanorama} 
          />
          
          <FileInput 
            label="2D Floorplan" 
            accept="image/*,.pdf" 
            onDrop={handleUploadFloorplan} 
            isUploaded={!!customFloorplan} 
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

        </div>
      </div>
    </div>
  );
}
