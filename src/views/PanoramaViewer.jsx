import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useTexture, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useViewerStore } from '../store/viewerStore';

// An inverted sphere holding a 360 latlong image
function SphericalPanorama() {
  const { customTourNodes, activeTourNodeId, setActiveTourNodeId } = useViewerStore();
  
  // Use the spatial network if valid, otherwise fallback to null
  const activeNode = customTourNodes ? customTourNodes[activeTourNodeId] : null;
  const textureUrl = activeNode ? activeNode.url : null;

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
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div className="glass-panel" style={{ padding: '8px 24px', borderRadius: '30px' }}>
          Drag to look around 360°
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }}>
        <Suspense fallback={null}>
          <SphericalPanorama />
          
          {/* We use negative rotation speed to fix dragging inverse feeling inside a sphere */}
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            rotateSpeed={-0.5} 
            makeDefault 
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
