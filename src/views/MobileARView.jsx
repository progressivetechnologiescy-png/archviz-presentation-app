import React, { useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';

export default function MobileARView() {
  const { customFBX } = useViewerStore();
  
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

  // Determine which model to use based on extension.
  // If they uploaded a GLB, let Android/Desktop use it. If they uploaded a USDZ, let Apple use it!
  const isGLB = customFBX && customFBX.toLowerCase().endsWith('.glb');
  const isUSDZ = customFBX && customFBX.toLowerCase().endsWith('.usdz');

  const androidSrc = isGLB ? customFBX : 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
  const appleSrc = isUSDZ ? customFBX : 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz';

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

      <div style={{ flex: 1, position: 'relative' }}>
        <model-viewer 
          src={androidSrc}
          ios-src={appleSrc}
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
