import React, { Suspense, useState, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, DeviceOrientationControls, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useViewerStore } from '../store/viewerStore';
import { Smartphone, ChevronLeft, Eye, EyeOff, Maximize, MapPin, Plus, X, Hexagon } from 'lucide-react';

// Helper to track camera rotation for the CMS "Set Starting View"
function CameraTracker() {
  const { camera } = useThree();
  useEffect(() => {
    const handleUpdate = () => {
      window.__currentPanoCamera = {
        position: [camera.position.x, camera.position.y, camera.position.z],
        rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z],
        target: [0, 0, 0]
      };
    };
    camera.parent?.addEventListener('change', handleUpdate);
    return () => camera.parent?.removeEventListener('change', handleUpdate);
  }, [camera]);
  return null;
}

// Applies the saved initial camera orientation when the active node changes
function CameraPatcher({ activeNode }) {
  const { camera } = useThree();
  const controls = useThree(state => state.controls);
  
  useEffect(() => {
    if (activeNode && activeNode.initial_camera) {
      camera.position.set(...activeNode.initial_camera.position);
      camera.rotation.set(...activeNode.initial_camera.rotation);
      if (controls && activeNode.initial_camera.target) {
        controls.target.set(...activeNode.initial_camera.target);
        controls.update();
      }
    } else {
      camera.position.set(0, 0, 0.1);
      camera.rotation.set(0, 0, 0);
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.update();
      }
    }
  }, [activeNode, camera, controls]);
  
  return null;
}

// Advanced Hotspot Marker
function TourHotspot({ spot, onClick }) {
  // Styles based on spot type
  const isDetailed = spot.type === 'detailed-label';
  const isTextBox = spot.type === 'text-box';
  const isPin = spot.type === 'simple-pin';

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onClick(spot); }}
      onPointerDown={(e) => { e.stopPropagation(); onClick(spot); }}
      onTouchStart={(e) => { e.stopPropagation(); onClick(spot); }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
        transform: 'translate(-50%, -100%)', // Anchor at bottom center
        pointerEvents: 'auto', userSelect: 'none'
      }}
    >
      {isDetailed && (
        <>
          <div className="glass-panel" style={{ background: 'rgba(10, 12, 16, 0.8)', backdropFilter: 'blur(16px)', color: 'white', padding: '6px 16px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '4px', border: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
            {spot.label}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', color: 'var(--accent-color)', padding: '4px 12px', borderRadius: '12px', fontSize: '9px', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '12px', whiteSpace: 'nowrap', border: '1px solid var(--accent-color)' }}>
            {spot.subLabel}
          </div>
          <div style={{ width: '32px', height: '32px', background: 'var(--bg-dark)', border: '2px solid var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)', fontSize: '11px', fontWeight: 'bold', zIndex: 2, boxShadow: '0 0 15px var(--accent-glow)' }}>
            {spot.percentage}
          </div>
          <div style={{ width: '2px', height: '60px', background: 'linear-gradient(to bottom, var(--accent-color), transparent)', marginTop: '-2px', zIndex: 1 }} />
        </>
      )}

      {isTextBox && (
        <>
          <div className="glass-panel" style={{ background: 'rgba(10, 12, 16, 0.8)', backdropFilter: 'blur(16px)', color: 'white', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.1)' }}>
            {spot.label}
          </div>
          <div style={{ width: '1px', height: '80px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)', zIndex: 1 }} />
          <div style={{ width: '24px', height: '24px', background: 'rgba(10, 12, 16, 0.9)', border: '1px solid var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)', zIndex: 2, marginTop: '-2px' }}>
            <Plus size={14} strokeWidth={3} />
          </div>
        </>
      )}

      {isPin && (
        <>
          <div className="glass-panel" style={{ background: 'rgba(10, 12, 16, 0.8)', backdropFilter: 'blur(16px)', color: 'white', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', whiteSpace: 'nowrap', opacity: spot.label ? 1 : 0, border: '1px solid rgba(255,255,255,0.1)' }}>
            {spot.label || 'Details'}
          </div>
          <div style={{ width: '36px', height: '36px', background: 'rgba(10, 12, 16, 0.8)', backdropFilter: 'blur(16px)', border: '2px solid var(--accent-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-color)', boxShadow: '0 0 15px var(--accent-glow)' }}>
            <Plus size={18} strokeWidth={2.5} />
          </div>
        </>
      )}
    </div>
  );
}

// Subcomponent to handle the dual-sphere blending and camera warping transition
function MorphingPanorama({ activeNode, showHotspots, onHotspotClick, onSphereClick }) {
  const { camera } = useThree();
  const [transition, setTransition] = useState({
    prevUrl: null,
    currentUrl: activeNode?.url,
    progress: 1.0
  });

  const prevActiveNodeUrlRef = React.useRef(activeNode?.url);

  useEffect(() => {
    const currentUrl = activeNode?.url;
    const prevUrl = prevActiveNodeUrlRef.current;
    
    if (currentUrl && currentUrl !== prevUrl) {
      setTransition({
        prevUrl: prevUrl || currentUrl,
        currentUrl: currentUrl,
        progress: 0.0
      });
      prevActiveNodeUrlRef.current = currentUrl;
    }
  }, [activeNode]);

  // Safe 1x1 transparent PNG pixel to prevent useTexture from failing or suspending indefinitely when URL is missing
  const transparentPixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  // Load both current and previous panorama textures safely
  const currentTex = useTexture(transition.currentUrl || activeNode?.url || transparentPixel);
  const prevTex = useTexture(transition.prevUrl || transition.currentUrl || activeNode?.url || transparentPixel);

  // Clone textures to invert X repeating for clean interior rendering
  const currentCloned = useMemo(() => {
    if (!currentTex) return null;
    const clone = currentTex.clone();
    clone.wrapS = THREE.RepeatWrapping;
    clone.repeat.x = -1;
    clone.needsUpdate = true;
    return clone;
  }, [currentTex]);

  const prevCloned = useMemo(() => {
    if (!prevTex) return null;
    const clone = prevTex.clone();
    clone.wrapS = THREE.RepeatWrapping;
    clone.repeat.x = -1;
    clone.needsUpdate = true;
    return clone;
  }, [prevTex]);

  const baseFov = 75;

  useFrame((state, delta) => {
    if (transition.progress < 1.0) {
      // Complete transition over 0.75 seconds
      const nextProgress = Math.min(transition.progress + delta * 1.4, 1.0);
      setTransition(prev => ({ ...prev, progress: nextProgress }));

      // Camera FOV Warp Effect:
      // Smoothly zoom in to FOV 40 (waist of transition) then zoom out to FOV 75
      let targetFov = baseFov;
      if (nextProgress < 0.5) {
        const t = nextProgress / 0.5;
        targetFov = THREE.MathUtils.lerp(baseFov, 42, t * t);
      } else {
        const t = (nextProgress - 0.5) / 0.5;
        targetFov = THREE.MathUtils.lerp(42, baseFov, t * (2 - t));
      }
      
      camera.fov = targetFov;
      camera.updateProjectionMatrix();
    }
  });

  const showPrev = transition.progress < 1.0 && transition.prevUrl !== transition.currentUrl && prevCloned;

  if (!currentCloned) {
    return (
      <mesh>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial color="#1f2937" side={THREE.BackSide} wireframe />
      </mesh>
    );
  }

  return (
    <group>
      {/* Previous Panorama fading out */}
      {showPrev && (
        <mesh>
          <sphereGeometry args={[500, 60, 40]} />
          <meshBasicMaterial 
            map={prevCloned} 
            side={THREE.BackSide} 
            transparent 
            opacity={1.0 - transition.progress} 
          />
        </mesh>
      )}

      {/* Current/Target Panorama fading in */}
      <mesh 
        onClick={(e) => {
          if (onSphereClick) {
            e.stopPropagation();
            onSphereClick(e.point);
          }
        }}
      >
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial 
          map={currentCloned} 
          side={THREE.BackSide} 
          transparent={!!showPrev}
          opacity={showPrev ? transition.progress : 1.0} 
        />
      </mesh>

      {/* Render Hotspots only when the transition is near completion for clutter-free views */}
      {showHotspots && transition.progress > 0.4 && activeNode?.hotspots?.map((spot) => (
        <Html key={spot.id} position={spot.position} center zIndexRange={[100, 0]}>
          <TourHotspot spot={spot} onClick={onHotspotClick} />
        </Html>
      ))}
    </group>
  );
}

// An inverted sphere holding a 360 latlong image
function SphericalPanorama({ showHotspots, onHotspotClick, onSphereClick }) {
  const { customTourNodes, activeTourNodeId } = useViewerStore();
  const activeNode = customTourNodes ? customTourNodes[activeTourNodeId] : null;

  return (
    <MorphingPanorama 
      activeNode={activeNode} 
      showHotspots={showHotspots}
      onHotspotClick={onHotspotClick}
      onSphereClick={onSphereClick}
    />
  );
}

export default function PanoramaViewer({ isEditing = false, onCanvasClick = null }) {
  const [useGyro, setUseGyro] = useState(false);
  const inventoryUnits = useViewerStore(state => state.inventoryUnits);
  
  const { companyName, activeTourNodeId, customTourNodes, setActiveTourNodeId, activeHotspotData, setActiveHotspotData } = useViewerStore();

  const handleHotspotClick = (spot) => {
    if (spot.targetNodeId && customTourNodes[spot.targetNodeId]) {
      setActiveTourNodeId(spot.targetNodeId);
      setActiveHotspotData(null); // Clear panel on navigation
    }
  };

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const requestGyro = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          setUseGyro(true);
        } else {
          alert('Gyroscope access denied. To fix this on iOS, go to Settings > Safari > clear history, or ensure "Motion & Orientation Access" is enabled, then refresh.');
        }
      } catch (error) {
        console.error('Error requesting gyroscope permission:', error);
        alert(`Gyro error: ${error.message || error}`);
        setUseGyro(true);
      }
    } else {
      setUseGyro(true);
    }
  };

  // Render a gorgeous glassmorphic loading/empty state if no tour nodes exist
  if (!customTourNodes || Object.keys(customTourNodes).length === 0 || !activeTourNodeId || !customTourNodes[activeTourNodeId]) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--bg-gradient, radial-gradient(circle at top, #1e293b, #0f172a))', 
        color: 'white',
        fontFamily: 'Outfit, sans-serif',
        padding: '24px',
        textAlign: 'center'
      }}>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.96); }
          }
        `}</style>
        <div style={{
          padding: '48px 32px',
          borderRadius: '24px',
          background: 'rgba(10, 12, 16, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--accent-color, #60a5fa)',
            boxShadow: '0 0 20px var(--accent-glow, rgba(96, 165, 250, 0.15))'
          }}>
            <Hexagon size={32} style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          </div>
          
          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '700', letterSpacing: '0.5px' }}>
              360° Virtual Tours
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.6' }}>
              We are currently preparing immersive 360° virtual walkthroughs for this property. Check back soon or connect with a lead broker!
            </p>
          </div>
          
          {isEditing && (
            <div style={{ fontSize: '12px', color: 'var(--accent-color, #60a5fa)', background: 'rgba(96, 165, 250, 0.08)', padding: '10px 18px', borderRadius: '12px', border: '1px solid rgba(96, 165, 250, 0.15)', fontWeight: '600' }}>
              ℹ️ Admin Tip: Go to the "Manage" tab to upload panorama images and build your hotspots.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0a0c10' }}>
      
      {/* Top Controls removed per user request */}
      
      {isTouchDevice && !isEditing && (
        <button 
          onClick={() => useGyro ? setUseGyro(false) : requestGyro()}
          style={{ position: 'absolute', top: '50%', right: '24px', transform: 'translateY(-50%)', zIndex: 10, width: '48px', height: '48px', borderRadius: '50%', background: useGyro ? 'var(--accent-color)' : 'rgba(10, 12, 16, 0.8)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: useGyro ? '0 0 15px var(--accent-glow)' : 'none' }}
        >
          <Smartphone size={20} />
        </button>
      )}

      {/* Slide-out Side Panel Removed per user request */}

      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <Suspense fallback={
          <Html center>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontFamily: 'Outfit, sans-serif',
              gap: '16px',
              whiteSpace: 'nowrap',
              background: 'rgba(10, 12, 16, 0.75)',
              padding: '24px 36px',
              borderRadius: '20px',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.4)'
            }}>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
              <div style={{
                width: '36px',
                height: '36px',
                border: '3px solid rgba(255,255,255,0.08)',
                borderTopColor: 'var(--accent-color, #60a5fa)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
                Loading Immersive 360°...
              </span>
            </div>
          </Html>
        }>
          <CameraTracker />
          <CameraPatcher activeNode={customTourNodes ? customTourNodes[activeTourNodeId] : null} />
          <SphericalPanorama showHotspots={true} onHotspotClick={handleHotspotClick} onSphereClick={isEditing ? onCanvasClick : null} />
          
          {useGyro ? (
            <DeviceOrientationControls />
          ) : (
            <OrbitControls 
              enableZoom={true} 
              enablePan={false} 
              rotateSpeed={-0.5} 
              makeDefault 
              onChange={(e) => {
                 // The CameraTracker handles the update on camera.parent change, 
                 // but we can also forcefully update here if needed.
                 const cam = e.target.object;
                 window.__currentPanoCamera = {
                   position: [cam.position.x, cam.position.y, cam.position.z],
                   rotation: [cam.rotation.x, cam.rotation.y, cam.rotation.z],
                   target: [e.target.target.x, e.target.target.y, e.target.target.z]
                 };
              }}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
