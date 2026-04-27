import React, { useEffect } from 'react';
import ViewerCanvas from '../components/ViewerCanvas';
import { useViewerStore } from '../store/viewerStore';
import { supabase } from '../lib/supabase';

export default function EmbedView() {
  const fetchCloudAssets = useViewerStore(state => state.fetchCloudAssets);
  
  useEffect(() => {
    fetchCloudAssets(supabase);
  }, [fetchCloudAssets]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <ViewerCanvas />
      
      {/* Optional: Minimal branding or VR button overlay */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 10 }}>
        <div style={{ 
          background: 'rgba(20,22,28,0.6)', 
          backdropFilter: 'blur(8px)', 
          padding: '8px 16px', 
          borderRadius: '20px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '12px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          Powered by ArchViz
        </div>
      </div>
    </div>
  );
}
