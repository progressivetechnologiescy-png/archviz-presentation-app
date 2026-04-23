import React, { useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { supabase } from '../lib/supabase';

export default function MobileARView({ isEmbedded = false }) {
  const { customGLB, customUSDZ, fetchCloudAssets } = useViewerStore();
  
  useEffect(() => {
    fetchCloudAssets(supabase);
  }, [fetchCloudAssets]);

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

  // Use the explicitly uploaded GLB for Android/WebXR.
  // For Apple AR QuickLook, if a customUSDZ is NOT provided, passing 'undefined' 
  // will force <model-viewer> to automatically generate one on the fly from the GLB!
  const androidSrc = customGLB || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
  const appleSrc = customUSDZ || undefined;

  // Fix CAD export bugs and apply photorealistic PBR to the AR model once it loads
  useEffect(() => {
    const viewer = document.getElementById('ar-viewer');
    if (!viewer) return;

    const handleLoad = () => {
      if (!viewer.model || !viewer.model.materials) return;
      
      viewer.model.materials.forEach(mat => {
        try {
          // Strip broken/black texture maps in the GLB to reveal the true white wall colors
          if (mat.pbrMetallicRoughness.baseColorTexture) {
            mat.pbrMetallicRoughness.baseColorTexture.texture = null;
          }
        } catch {
          // Ignore if API doesn't support texture removal
        }
        
        // Sleek architectural PBR finish
        mat.pbrMetallicRoughness.setRoughnessFactor(0.2);
        mat.pbrMetallicRoughness.setMetallicFactor(0.1);
      });
    };

    viewer.addEventListener('load', handleLoad);
    return () => viewer.removeEventListener('load', handleLoad);
  }, [androidSrc]);

  return (
    <div style={{ 
      width: '100vw', height: '100dvh', 
      background: 'linear-gradient(to bottom, #1e1e24, #000000)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Outfit, sans-serif'
    }}>
      
      {/* Header - Hidden when embedded inside PresentationApp */}
      {!isEmbedded && (
        <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>The Pinnacle Residence</h1>
          <p style={{ color: 'var(--accent-color)', margin: '4px 0 0 0', fontWeight: 'bold' }}>WebXR Interactive Layer</p>
        </div>
      )}

      <div style={{ flex: 1, position: 'relative' }}>
        <model-viewer 
          id="ar-viewer"
          src={androidSrc}
          ios-src={appleSrc}
          ar 
          ar-modes="webxr scene-viewer quick-look" 
          ar-scale="auto"
          ar-placement="floor"
          camera-controls 
          touch-action="pan-y"
          auto-rotate
          shadow-intensity="0.5"
          shadow-softness="1"
          style={{ width: '100%', height: '100%', '--poster-color': 'transparent' }}
        >
        </model-viewer>

        {/* AR Controls Area */}
        <div style={{ 
          position: 'absolute', bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))', 
          left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
          width: '100%', maxWidth: '350px'
        }}>
          
          {/* Instructions Banner */}
          <div style={{
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
            padding: '12px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.9)'
          }}>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
              <strong>Manual Control Enabled</strong><br/>
              Pinch to scale • Drag to position • Double-tap to reset
            </p>
          </div>

          {/* Custom AR Button */}
          <button 
            onClick={() => {
              const viewer = document.getElementById('ar-viewer');
              if (viewer && viewer.activateAR) {
                viewer.activateAR();
              } else {
                alert("AR is initializing or not supported on this specific device/browser.");
              }
            }}
            style={{ 
              background: 'var(--accent-color)', color: 'white', border: 'none', 
              padding: '16px 32px', borderRadius: '30px', fontWeight: 'bold', fontSize: '18px',
              fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 24px var(--accent-glow)',
              cursor: 'pointer', zIndex: 1000, whiteSpace: 'nowrap', width: '100%'
            }}
          >
            Drop in AR
          </button>
        </div>
      </div>

    </div>
  );
}
