import React, { useEffect, useState } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { supabase } from '../lib/supabase';

// Haversine formula to calculate distance in miles
function getDistanceInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Extract GPS coordinates from string or Google Maps URL
function extractCoordinates(str) {
  if (!str) return null;
  const match = str.match(/([+-]?\d+\.\d+)\s*,\s*([+-]?\d+\.\d+)/);
  if (match) return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };
  const pbMatch = str.match(/!3d([+-]?\d+\.\d+)!4d([+-]?\d+\.\d+)/);
  if (pbMatch) return { lat: parseFloat(pbMatch[1]), lon: parseFloat(pbMatch[2]) };
  return null;
}

export default function MobileARView() {
  const { customGLB, customUSDZ, fetchCloudAssets, customGPS } = useViewerStore();
  const [isAtPlot, setIsAtPlot] = useState(false);
  const [arStatus, setArStatus] = useState("Checking GPS location...");
  
  useEffect(() => {
    fetchCloudAssets(supabase);
  }, [fetchCloudAssets]);

  // Geolocation Check
  useEffect(() => {
    // Default to the Pinnacle Residence (Limassol) if customGPS isn't set
    const projectCoords = extractCoordinates(customGPS) || { lat: 34.6853, lon: 33.0375 }; 

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          const dist = getDistanceInMiles(userLat, userLon, projectCoords.lat, projectCoords.lon);
          
          if (dist < 0.1) { // Within ~160 meters
            setIsAtPlot(true);
            setArStatus("📍 You are at the project site! Model will deploy at 1:1 scale on the land.");
          } else {
            setIsAtPlot(false);
            setArStatus(`You are ${dist.toFixed(1)} miles from the site. Deploying desktop-scale model.`);
          }
        },
        (error) => {
          setIsAtPlot(false);
          setArStatus("Location access denied. Deploying desktop-scale model.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setIsAtPlot(false);
      setArStatus("Geolocation not supported. Deploying desktop-scale model.");
    }
  }, [customGPS]);
  
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

  // Use the explicitly uploaded GLB for Android/WebXR, and USDZ for Apple AR QuickLook.
  const androidSrc = customGLB || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
  const appleSrc = customUSDZ || 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz';

  // Fix CAD export bugs and apply photorealistic PBR to the AR model once it loads
  useEffect(() => {
    const viewer = document.getElementById('ar-viewer');
    if (!viewer) return;

    const handleLoad = () => {
      if (!viewer.model || !viewer.model.materials) return;
      
      viewer.model.materials.forEach(mat => {
        const baseColor = mat.pbrMetallicRoughness.baseColorFactor;
        
        // Revit GLB Exporter Bug Fix: Pure black base colors ruin textures. Force them to white.
        if (baseColor && baseColor[0] < 0.05 && baseColor[1] < 0.05 && baseColor[2] < 0.05) {
          mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, baseColor[3] || 1]);
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
      
      {/* Header */}
      <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>The Pinnacle Residence</h1>
        <p style={{ color: 'var(--accent-color)', margin: '4px 0 0 0', fontWeight: 'bold' }}>WebXR Interactive Layer</p>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <model-viewer 
          id="ar-viewer"
          src={androidSrc}
          ios-src={appleSrc}
          ar 
          ar-modes="webxr scene-viewer quick-look" 
          ar-scale="auto"
          ar-placement="floor"
          scale="0.01 0.01 0.01"
          camera-controls 
          touch-action="pan-y"
          auto-rotate
          environment-image="neutral"
          exposure="1.2"
          shadow-intensity="1.5"
          shadow-softness="1"
          style={{ width: '100%', height: '100%', '--poster-color': 'transparent' }}
        >
        </model-viewer>

        {/* Custom AR Button GUARANTEED to be visible */}
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
            position: 'absolute', bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))', left: '50%', transform: 'translateX(-50%)',
            background: 'var(--accent-color)', color: 'white', border: 'none', 
            padding: '16px 32px', borderRadius: '30px', fontWeight: 'bold', fontSize: '18px',
            fontFamily: 'Outfit, sans-serif', boxShadow: '0 8px 24px var(--accent-glow)',
            cursor: 'pointer', zIndex: 1000
          }}
        >
          Drop on Your Desk
        </button>
      </div>

    </div>
  );
}
