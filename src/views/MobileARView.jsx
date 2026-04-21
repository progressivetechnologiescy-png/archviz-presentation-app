import React, { useEffect } from 'react';

export default function MobileARView() {
  
  // Dynamically inject Google's model-viewer script on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div style={{ 
      width: '100vw', height: '100vh', 
      background: 'linear-gradient(to bottom, #1e1e24, #000000)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Outfit, sans-serif'
    }}>
      
      {/* Header */}
      <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>The Pinnacle Residence</h1>
        <p style={{ color: 'var(--accent-color)', margin: '4px 0 0 0', fontWeight: 'bold' }}>WebXR Interactive Layer</p>
      </div>

      {/* 
        Google <model-viewer> 
        Needs a .glb file to hook natively into ARKit (iOS) / SceneViewer (Android).
        We use a high-quality placeholder chair from the Google demo library to prove the desk-drop stack works flawlessly via QR context!
      */}
      <div style={{ flex: 1, position: 'relative' }}>
        <model-viewer 
          src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
          ios-src="https://modelviewer.dev/shared-assets/models/Astronaut.usdz"
          ar 
          ar-modes="webxr scene-viewer quick-look" 
          camera-controls 
          touch-action="pan-y"
          auto-rotate
          shadow-intensity="1"
          style={{ width: '100%', height: '100%', '--poster-color': 'transparent' }}
        >
          {/* Custom AR Button */}
          <button 
            slot="ar-button" 
            style={{ 
              position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
              background: 'var(--accent-color)', color: 'white', border: 'none', 
              padding: '16px 32px', borderRadius: '30px', fontWeight: 'bold', fontSize: '18px',
              fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 24px var(--accent-glow)',
              cursor: 'pointer'
            }}
          >
            Drop on Your Desk
          </button>
        </model-viewer>
      </div>

    </div>
  );
}
