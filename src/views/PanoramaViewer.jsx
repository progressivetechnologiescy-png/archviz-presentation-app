import React, { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, DeviceOrientationControls, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useViewerStore } from '../store/viewerStore';
import { Smartphone, ChevronLeft, Eye, EyeOff, Maximize, MapPin, Plus } from 'lucide-react';

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
    } else if (spot.panelData) {
      setActiveHotspotData(spot.panelData);
    }
  };

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#0a0c10' }}>
      
      {/* Removed Top Controls per user request */}

      {/* Slide-out Side Panel */}
      <div style={{
        position: 'absolute', top: 0, right: 0, height: '100%', width: '400px', maxWidth: '100%', zIndex: 40,
        background: 'rgba(10, 12, 16, 0.85)', backdropFilter: 'blur(24px)', borderLeft: '1px solid rgba(255,255,255,0.05)',
        transform: activeHotspotData ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '100px 32px 32px 32px', display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)', color: 'white'
      }}>
        {activeHotspotData && (() => {
          const unitData = activeHotspotData.unitId ? inventoryUnits?.find(u => u.id === activeHotspotData.unitId) : null;
          
          const getStatusColor = (status) => {
            switch(status) {
              case 'Available': return 'rgba(34, 197, 94, 0.2)';
              case 'Reserved': return 'rgba(234, 179, 8, 0.2)';
              case 'Sold': return 'rgba(239, 68, 68, 0.2)';
              default: return 'transparent';
            }
          };
          const getStatusTextColor = (status) => {
            switch(status) {
              case 'Available': return '#4ade80';
              case 'Reserved': return '#facc15';
              case 'Sold': return '#f87171';
              default: return 'white';
            }
          };

          return (
            <>
              <button 
                onClick={() => setActiveHotspotData(null)}
                style={{ position: 'absolute', top: '32px', right: '32px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', transition: 'all 0.2s' }}
                className="hover-lift"
              >
                ✕
              </button>
              <h2 style={{ fontSize: '48px', fontWeight: '300', margin: '0 0 16px 0', color: 'white', lineHeight: '1.1' }}>
                {activeHotspotData.title.split(' ')[0]}<br/>
                <strong style={{ fontWeight: '800' }}>{activeHotspotData.title.split(' ').slice(1).join(' ')}</strong>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
                {activeHotspotData.subtitle || 'Showcase your property with an immersive sense of presence. Let your buyers explore the space with freedom.'}
              </p>
              
              {unitData ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 0', marginBottom: '32px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Price</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--accent-color)' }}>{unitData.price}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Area (Sqft)</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>{unitData.sqft}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Status</div>
                    <div style={{ 
                      fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '12px', display: 'inline-block',
                      background: getStatusColor(unitData.status), color: getStatusTextColor(unitData.status), border: `1px solid ${getStatusTextColor(unitData.status)}40` 
                    }}>
                      {unitData.status}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 0', marginBottom: '32px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Total Area</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>{activeHotspotData.area || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Beds</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>{activeHotspotData.beds || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Roof Garden</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>{activeHotspotData.roof || 'N/A'}</div>
                  </div>
                </div>
              )}

              {activeHotspotData.image && (
                <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={activeHotspotData.image} alt="Property" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <button className="hover-lift" style={{ width: '100%', padding: '16px', background: 'var(--accent-color)', border: 'none', color: 'white', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px var(--accent-glow)' }}>
                {unitData ? 'Inquire Unit #' + unitData.id : 'Book A Demo'}
              </button>
            </>
          );
        })()}
      </div>

      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }} style={{ width: activeHotspotData ? 'calc(100% - 400px)' : '100%', transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <Suspense fallback={null}>
          <SphericalPanorama showHotspots={true} onHotspotClick={handleHotspotClick} />
          <OrbitControls enableZoom={true} enablePan={false} rotateSpeed={-0.5} makeDefault />
        </Suspense>
      </Canvas>
    </div>
  );
}
