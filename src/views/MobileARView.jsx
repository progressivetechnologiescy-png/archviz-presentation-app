import React, { useEffect, useState } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { supabase } from '../lib/supabase';

export default function MobileARView({ isEmbedded = false }) {
  const { 
    customGLB, 
    customUSDZ, 
    customFBX, 
    primaryModel, 
    isFetchingAssets, 
    fetchCloudAssets,
    accentColor = '#3b82f6'
  } = useViewerStore();

  const [bypassOffline, setBypassOffline] = useState(false);
  const isDbOffline = !supabase && !bypassOffline;
  
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

  const accentGlow = `${accentColor}40`; // 25% opacity

  // Determine the active model URL. For AR drops, ALWAYS prioritize the GLB file if available since FBX cannot be loaded in <model-viewer>!
  const modelUrl = customGLB || (primaryModel && !primaryModel.toLowerCase().endsWith('.fbx') && !primaryModel.toLowerCase().endsWith('.obj') ? primaryModel : '') || customFBX || '';
  const isGLTF = modelUrl.toLowerCase().endsWith('.glb') || modelUrl.toLowerCase().endsWith('.gltf') || (modelUrl && !modelUrl.includes('sketchfab.com') && !modelUrl.toLowerCase().endsWith('.fbx') && !modelUrl.toLowerCase().endsWith('.obj'));
  const isSketchfab = modelUrl && modelUrl.includes('sketchfab.com');
  
  const isDefaultFBX = modelUrl === '/3D_FINAL.fbx' || modelUrl.endsWith('/3D_FINAL.fbx');
  const isSamplePreview = !modelUrl || isDefaultFBX;
  const isFBX = (modelUrl.toLowerCase().endsWith('.fbx') || modelUrl.toLowerCase().endsWith('.obj')) && !isDefaultFBX;

  // Use the explicitly uploaded GLB for Android/WebXR, or default to Astronaut
  const androidSrc = isGLTF ? modelUrl : (isSamplePreview ? 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' : '');
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

  // 0. Premium Obsidian Glass Warning modal for offline database configurations on mobile devices
  if (isDbOffline) {
    return (
      <div style={{
        width: '100vw', height: '100dvh',
        background: 'linear-gradient(to bottom, #111216, #060709)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Outfit, sans-serif', color: 'white', padding: '24px', boxSizing: 'border-box'
      }}>
        <div className="glass-panel" style={{
          background: 'rgba(18, 20, 28, 0.85)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center', maxWidth: '440px', width: '100%',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'
        }}>
          {/* Warning Icon */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)', borderRadius: '50%',
            width: '56px', height: '56px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: '20px', boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>Vercel Config Missing</h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
            This mobile device cannot load your custom 3D files because the **Supabase Environment Variables** have not been added to your production hosting (Vercel) dashboard.
          </p>

          <div style={{
            width: '100%', background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px',
            padding: '16px', textAlign: 'left', marginBottom: '24px', boxSizing: 'border-box'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', color: accentColor, fontWeight: 'bold', letterSpacing: '0.5px' }}>
              How to fix this:
            </h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ color: accentColor, fontWeight: 'bold', fontSize: '13px' }}>1.</span>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4' }}>
                Open your **Vercel Project Settings** and navigate to the **Environment Variables** tab.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ color: accentColor, fontWeight: 'bold', fontSize: '13px' }}>2.</span>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4' }}>
                Add **`VITE_SUPABASE_URL`** & **`VITE_SUPABASE_ANON_KEY`** (copied from your local `.env` file).
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: accentColor, fontWeight: 'bold', fontSize: '13px' }}>3.</span>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4' }}>
                Redeploy the project in Vercel to apply the configuration.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <button
              onClick={() => {
                alert("To add them:\n\n1. Copy the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values from your local project's .env file.\n2. Paste them into Vercel project's Environment Variables dashboard.");
              }}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: accentColor, color: '#ffffff',
                fontWeight: 'bold', fontSize: '15px', cursor: 'pointer',
                boxShadow: `0 8px 24px ${accentGlow}`, transition: 'all 0.3s'
              }}
            >
              Show Variable Guidelines
            </button>
            <button
              onClick={() => setBypassOffline(true)}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '14px'
              }}
            >
              Load Sample Preview Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 1. Premium glassmorphic loader while fetching cloud records
  if (isFetchingAssets) {
    return (
      <div style={{
        width: '100vw', height: '100dvh',
        background: 'linear-gradient(to bottom, #111216, #060709)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Outfit, sans-serif', color: 'white', padding: '24px', boxSizing: 'border-box'
      }}>
        <div className="glass-panel" style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
          borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center', maxWidth: '320px', width: '100%',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'
        }}>
          {/* Animated Spinner Ring */}
          <div style={{
            position: 'relative', width: '60px', height: '60px', marginBottom: '24px'
          }}>
            <div style={{
              boxSizing: 'border-box', display: 'block', position: 'absolute',
              width: '60px', height: '60px', margin: '0',
              border: '4px solid rgba(255, 255, 255, 0.1)', borderRadius: '50%'
            }} />
            <div style={{
              boxSizing: 'border-box', display: 'block', position: 'absolute',
              width: '60px', height: '60px', margin: '0',
              border: '4px solid transparent', borderTopColor: accentColor,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>Retrieving Cloud Assets</h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>
            Establishing connection & loading the latest interactive spatial configurations...
          </p>
        </div>
      </div>
    );
  }

  // 2. High-fidelity full-screen Sketchfab Interactive Embed for mobile
  if (isSketchfab) {
    const parts = modelUrl.split('/');
    const lastPart = parts[parts.length - 1] || parts[parts.length - 2] || '';
    const idMatch = lastPart.match(/[a-f0-9]{32}/i);
    const modelId = idMatch ? idMatch[0] : lastPart;
    const sketchfabEmbedUrl = `https://sketchfab.com/models/${modelId}/embed?autostart=1&internal=1&tracking=0&ui_ar=1&ui_help=0&ui_vr=1&ui_settings=1&ui_inspector=0&ui_annotations=1&ui_animations=1&camera=0`;

    return (
      <div style={{ 
        width: '100vw', height: '100dvh', 
        background: '#0a0c10',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Outfit, sans-serif'
      }}>
        {/* Sketchfab Embedded Header */}
        {!isEmbedded && (
          <div style={{ 
            padding: '16px 24px', 
            background: 'rgba(10, 12, 16, 0.9)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <h1 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: '600' }}>The Pinnacle Residence</h1>
              <p style={{ color: accentColor, margin: '2px 0 0 0', fontSize: '12px', fontWeight: 'bold' }}>Sketchfab Interactive Embed</p>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
              }}
            >
              Exit View
            </button>
          </div>
        )}
        <div style={{ flex: 1, position: 'relative' }}>
          <iframe
            title="Sketchfab Mobile 3D Model"
            src={sketchfabEmbedUrl}
            frameBorder="0"
            allowFullScreen
            mozallowfullscreen="true"
            webkitallowfullscreen="true"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    );
  }

  // 3. Premium Obsidian Glass Fallback Alert Card for FBX models
  if (isFBX) {
    return (
      <div style={{
        width: '100vw', height: '100dvh',
        background: 'linear-gradient(to bottom, #111216, #060709)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Outfit, sans-serif', color: 'white', padding: '24px', boxSizing: 'border-box'
      }}>
        <div className="glass-panel" style={{
          background: 'rgba(18, 20, 28, 0.85)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center', maxWidth: '480px', width: '100%',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'
        }}>
          {/* Warning Icon */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)', borderRadius: '50%',
            width: '56px', height: '56px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', marginBottom: '20px', boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 'bold' }}>AR Format Unsupported</h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5' }}>
            The current active model is formatted as an **FBX file**. Mobile WebXR and Apple QuickLook AR require WebGL-optimized **GLB** or **USDZ** files.
          </p>

          <div style={{
            width: '100%', background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px',
            padding: '16px', textAlign: 'left', marginBottom: '24px', boxSizing: 'border-box'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', color: accentColor, fontWeight: 'bold', letterSpacing: '0.5px' }}>
              How to view this model on mobile
            </h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: accentColor, fontWeight: 'bold', fontSize: '13px' }}>•</span>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4' }}>
                Launch the **Interactive 3D WebGL Viewer** below to experience the original FBX file, fully textured and simulated in Three.js on your device.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '8px' }}>
              <span style={{ color: accentColor, fontWeight: 'bold', fontSize: '13px' }}>•</span>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4' }}>
                Upload a GLB version of your model in the **Presentation CMS** to enable immersive Augmented Reality (AR) drops.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <button
              onClick={() => window.location.href = '/embed'}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: accentColor, color: '#ffffff',
                fontWeight: 'bold', fontSize: '15px', cursor: 'pointer',
                boxShadow: `0 8px 24px ${accentGlow}`, transition: 'all 0.3s'
              }}
            >
              Launch Interactive 3D Viewer
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)', color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '14px'
              }}
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100vw', height: '100dvh', 
      background: 'linear-gradient(to bottom, #1e1e24, #000000)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Outfit, sans-serif',
      '--accent-color': accentColor,
      '--accent-glow': accentGlow
    }}>
      
      {/* Header - Hidden when embedded inside PresentationApp */}
      {!isEmbedded && (
        <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>The Pinnacle Residence</h1>
          <p style={{ color: accentColor, margin: '4px 0 0 0', fontWeight: 'bold' }}>WebXR Interactive Layer</p>
        </div>
      )}

      <div style={{ flex: 1, position: 'relative' }}>
        {/* Sample Preview Warning Banner */}
        {isSamplePreview && (
          <div style={{
            position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(217, 119, 6, 0.9)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '30px',
            padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', zIndex: 10
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>Demo Preview: Astronaut Sample loaded</span>
          </div>
        )}
        <style>{`
          @keyframes pulse {
            0% { opacity: 0.4; }
            50% { opacity: 1; }
            100% { opacity: 0.4; }
          }
        `}</style>

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
          camera-orbit="0deg 75deg 180%"
          shadow-intensity="0.5"
          shadow-softness="1"
          style={{ width: '100%', height: '100%', '--poster-color': 'transparent' }}
        >
          {/* Slotted Custom AR Button - bound natively by model-viewer for flawless touch trigger */}
          <button 
            slot="ar-button"
            style={{ 
              position: 'absolute', bottom: '32px', 
              left: '50%', transform: 'translateX(-50%)',
              background: 'var(--accent-color)', color: 'white', border: 'none', 
              padding: '16px 32px', borderRadius: '30px', fontWeight: 'bold', fontSize: '18px',
              fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 24px var(--accent-glow)',
              cursor: 'pointer', zIndex: 1000, whiteSpace: 'nowrap', width: '90%', maxWidth: '350px',
              display: 'block'
            }}
          >
            Drop in AR
          </button>
        </model-viewer>

        {/* Instructions Banner - Positioned right above the slotted AR button */}
        <div style={{
          position: 'absolute', bottom: '112px', 
          left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
          padding: '12px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.9)',
          width: '90%', maxWidth: '320px', pointerEvents: 'none', zIndex: 999
        }}>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
            <strong>Manual Control Enabled</strong><br/>
            Pinch to scale • Drag to position • Double-tap to reset
          </p>
        </div>
      </div>

    </div>
  );
}
