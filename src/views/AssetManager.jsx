import React, { useCallback, useState } from 'react';
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
            {isUploaded ? 'Loaded in Session' : `Click or Drop ${accept} file`}
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
    customFloorplan, setCustomFloorplan, 
    customPanorama, setCustomPanorama, 
    customRenders, addCustomRender, clearCustomRenders,
    customGPS, setCustomGPS
  } = useViewerStore();

  const [gpsInput, setGpsInput] = useState(customGPS || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadFBX = (file) => setCustomFBX(URL.createObjectURL(file));
  const handleUploadFloorplan = (file) => setCustomFloorplan(URL.createObjectURL(file));
  const handleUploadPanorama = (file) => setCustomPanorama(URL.createObjectURL(file));
  
  const handleUploadRenders = async (files) => {
    if (!supabase) {
      alert("Supabase Database is not connected! Using local session RAM instead.");
      clearCustomRenders();
      files.forEach(f => addCustomRender(URL.createObjectURL(f)));
      return;
    }

    setIsUploading(true);
    // Do not clear custom renders, append to them!
    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `renders/${fileName}`;

        // 1. Upload to Storage Bucket
        const { error: uploadError } = await supabase.storage
          .from('archviz_models')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('archviz_models')
          .getPublicUrl(filePath);

        // 3. Register it in the presentation_assets table
        const { error: dbError } = await supabase
          .from('presentation_assets')
          .insert({
            project_id: 'demo_project', 
            asset_type: 'render',
            asset_url: publicUrl
          });

        if (dbError) throw dbError;

        // 4. Update the local UI state dynamically
        addCustomRender(publicUrl);
      }
      alert(`Successfully uploaded ${files.length} renders to the Cloud Database!`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload renders to the Cloud Database. Check console.");
    } finally {
      setIsUploading(false);
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
            label="3D Model (FBX)" 
            accept=".fbx" 
            onDrop={handleUploadFBX} 
            isUploaded={!!customFBX} 
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
                <h4 style={{ margin: '0 0 4px 0' }}>Map Address or GPS</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Set the map location for the Location Map tab.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={gpsInput}
                onChange={(e) => setGpsInput(e.target.value)}
                placeholder="e.g., 40.7128,-74.0060 or 'Empire State Building'"
                style={{ 
                  flex: 1, padding: '12px 16px', borderRadius: '8px',
                  background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'white'
                }}
              />
              <button 
                onClick={() => setCustomGPS(gpsInput)}
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
