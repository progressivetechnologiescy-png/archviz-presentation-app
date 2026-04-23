import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, DeviceOrientationControls, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useViewerStore } from '../store/viewerStore';
import { Smartphone, ChevronLeft, Eye, EyeOff, Maximize, MapPin, Plus, X } from 'lucide-react';

// Advanced Hotspot Marker
function TourHotspot({ spot, onClick }) {
  // Styles based on spot type
  const isDetailed = spot.type === 'detailed-label';
  const isTextBox = spot.type === 'text-box';
  const isPin = spot.type === 'simple-pin';

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onClick(spot); }}
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

// Subcomponent to handle the actual texture loading and applying hotspots safely
function PanoramaSphere({ textureUrl, activeNode, showHotspots, onHotspotClick }) {
  const texture = useTexture(textureUrl);
  
  const clonedTexture = useMemo(() => {
    const clone = texture.clone();
    clone.wrapS = THREE.RepeatWrapping;
    clone.repeat.x = -1; 
    clone.needsUpdate = true;
    return clone;
  }, [texture]);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial map={clonedTexture} side={THREE.BackSide} />
      </mesh>

      {showHotspots && activeNode?.hotspots?.map((spot) => (
        <Html key={spot.id} position={spot.position} center zIndexRange={[100, 0]}>
          <TourHotspot spot={spot} onClick={onHotspotClick} />
        </Html>
      ))}
    </group>
  );
}

// An inverted sphere holding a 360 latlong image
function SphericalPanorama({ showHotspots, onHotspotClick }) {
  const { customPanorama, customTourNodes, activeTourNodeId } = useViewerStore();
  const activeNode = customTourNodes ? customTourNodes[activeTourNodeId] : null;
  const textureUrl = customPanorama || (activeNode ? activeNode.url : null);

  if (!textureUrl) {
    return (
      <mesh>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial color="#1f2937" side={THREE.BackSide} wireframe />
      </mesh>
    );
  }

  return (
    <PanoramaSphere 
      textureUrl={textureUrl} 
      activeNode={activeNode} 
      showHotspots={showHotspots}
      onHotspotClick={onHotspotClick}
    />
  );
}

export default function PanoramaViewer() {
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

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0a0c10' }}>
      
      {/* Removed Top Controls per user request */}

      {/* Slide-out Side Panel Removed per user request */}

      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }} style={{ width: '100%', height: '100%' }}>
        <Suspense fallback={null}>
          <SphericalPanorama showHotspots={true} onHotspotClick={handleHotspotClick} />
          <OrbitControls enableZoom={true} enablePan={false} rotateSpeed={-0.5} makeDefault />
        </Suspense>
      </Canvas>
    </div>
  );
}
