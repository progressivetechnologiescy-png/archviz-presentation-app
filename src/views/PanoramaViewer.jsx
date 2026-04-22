import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, DeviceOrientationControls, Environment, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useViewerStore } from '../store/viewerStore';
import { Smartphone } from 'lucide-react';

// An inverted sphere holding a 360 latlong image
function SphericalPanorama() {
  const { customPanorama, customTourNodes, activeTourNodeId, setActiveTourNodeId } = useViewerStore();
  
  // Use the standalone custom panorama first (from the Asset Manager)
  // Otherwise fallback to the complex spatial tour network
  const activeNode = customTourNodes ? customTourNodes[activeTourNodeId] : null;
  const textureUrl = customPanorama || (activeNode ? activeNode.url : null);

  const texture = textureUrl ? useTexture(textureUrl) : null;
  if(texture) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1; // Flip the image so it reads correctly from the inside!
  }

  return (
    <group>
      <mesh>
        <sphereGeometry args={[500, 60, 40]} />
        {texture ? (
          <meshBasicMaterial map={texture} side={THREE.BackSide} />
        ) : (
          <meshBasicMaterial color="#1f2937" side={THREE.BackSide} wireframe /> // Wireframe placeholder
        )}
      </mesh>

      {/* Render spatial interactive hotspots */}
      {activeNode && activeNode.hotspots && activeNode.hotspots.map((spot) => (
        <Html key={spot.id} position={spot.position} center>
          <button 
            className="hover-lift"
            onClick={() => setActiveTourNodeId(spot.targetId)}
            style={{
              background: 'rgba(59, 130, 246, 0.8)',
              backdropFilter: 'blur(8px)',
              padding: '12px 24px',
              borderRadius: '30px',
              border: '2px solid rgba(255,255,255,0.4)',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.5)'
            }}>
            {spot.label}
          </button>
        </Html>
      ))}
    </group>
  );
}

export default function PanoramaViewer() {
  const [useGyro, setUseGyro] = useState(false);

  const toggleGyro = () => {
    if (useGyro) {
      setUseGyro(false);
      return;
    }
    
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            setUseGyro(true);
          } else {
            alert('Gyroscope access denied. Please enable it in your browser settings.');
          }
        })
        .catch(console.error);
    } else {
      // Non-iOS 13+ devices
      setUseGyro(true);
    }
  };

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '120px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div className="glass-panel" style={{ padding: '8px 24px', borderRadius: '30px', animation: 'fadeOutOld 10s ease-in forwards' }}>
          Drag to look around 360°
        </div>
      </div>

      {isTouchDevice && !useGyro && (
        <div className="gyro-btn-wrapper" style={{ position: 'absolute', top: '180px', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
          <button 
            onClick={toggleGyro}
            className="glass-panel hover-lift"
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
              borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)',
              background: useGyro ? 'var(--accent-color)' : 'rgba(10, 12, 16, 0.8)',
              color: 'white', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: useGyro ? '0 8px 32px var(--accent-glow)' : '0 8px 32px rgba(0,0,0,0.5)'
            }}
          >
            <Smartphone size={20} />
            {useGyro ? 'Disable Gyroscope' : 'Enable Gyroscope'}
          </button>
        </div>
      )}

      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
        <Suspense fallback={null}>
          <SphericalPanorama />
          
          {useGyro ? (
            <DeviceOrientationControls makeDefault />
          ) : (
            <OrbitControls 
              enableZoom={false} 
              enablePan={false} 
              rotateSpeed={-0.5} 
              makeDefault 
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
