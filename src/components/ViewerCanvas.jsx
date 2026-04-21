import React, { useRef, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Html, useFBX, PerformanceMonitor, BakeShadows } from '@react-three/drei';
import { XR, createXRStore } from '@react-three/xr';
import { useViewerStore } from '../store/viewerStore';
import * as THREE from 'three';
import QRModal from './QRModal';

function WalkEngine() {
  const { moveForward, moveBackward, moveLeft, moveRight } = useViewerStore();
  
  // Reuse vectors to prevent garbage collection stuttering
  const direction = new THREE.Vector3();
  const frontVector = new THREE.Vector3();
  const sideVector = new THREE.Vector3();
  const speed = 15;

  useFrame((state, delta) => {
    if (!moveForward && !moveBackward && !moveLeft && !moveRight) return;

    // Calculate movement intent based on key combinations
    frontVector.set(0, 0, Number(moveBackward) - Number(moveForward));
    sideVector.set(Number(moveLeft) - Number(moveRight), 0, 0);

    // Combine and normalize vector
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(speed * delta);

    // Orient the movement direction to match where the camera is looking
    direction.applyEuler(new THREE.Euler(0, state.camera.rotation.y, 0));

    // Optional: lock Y axis to prevent "flying"
    direction.y = 0;

    // Translate the camera's physical position
    state.camera.position.add(direction);
    
    // Crucial: also translate OrbitControl's target, otherwise it anchors like a rubber band!
    if (state.controls && state.controls.target) {
      state.controls.target.add(direction);
    }
    
    // Process Look Direction (Virtual Rotation Pad)
    const storeState = useViewerStore.getState();
    if (state.controls && (storeState.lookLeft || storeState.lookRight)) {
      const azm = state.controls.getAzimuthalAngle();
      const lookSpeed = Math.PI * delta * 0.5; // rotate smoothly
      if (storeState.lookLeft) state.controls.setAzimuthalAngle(azm + lookSpeed);
      if (storeState.lookRight) state.controls.setAzimuthalAngle(azm - lookSpeed);
    }
  });

  return null;
}

// Load actual FBX model from user
function LoadedArchModel() {
  const { activeMaterial, customFBX, isTouring } = useViewerStore();
  const groupRef = React.useRef();
  
  // Conditionally load the uploaded FBX or the default project FBX
  const fbxPath = customFBX || '/3D FINAL.fbx';
  const fbx = useFBX(fbxPath);
  
  // Apply material overrides to the FBX meshes when the activeMaterial changes
  React.useEffect(() => {
    if (fbx) {
      let color = '#ffffff';
      if (activeMaterial === 'wood') color = '#cd853f';
      if (activeMaterial === 'marble') color = '#f0f4f8';
      if (activeMaterial === 'concrete') color = '#808080';

      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if(child.material) {
            if(child.material.color) {
               child.material.color.set(color);
            }
          }
        }
      });
    }
  }, [fbx, activeMaterial]);

  useFrame((state, delta) => {
    // Restored manual group rotation!
    // This isolates the rotation from WalkEngine so they never conflict
    if (useViewerStore.getState().isTouring && groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef} key={fbxPath}>
      <primitive object={fbx} scale={0.01} position={[0,0,0]} />
      <Html position={[2, 2.5, 2]} className="hotspot-annotation">
        <h4 style={{ margin: 0, fontSize: '14px', marginBottom: '4px' }}>Premium Finish</h4>
        <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>Real-time color applied to {activeMaterial}.</p>
      </Html>
    </group>
  );
}

const store = createXRStore();

export default function ViewerCanvas() {
  const { lightingPreset, isTouring } = useViewerStore();
  // Dynamic scaling for smoothness
  const [dpr, setDpr] = useState(1.5);
  const [showQR, setShowQR] = useState(false);

  // Determine HDRI Environment mapping
  let preset = 'apartment'; // Upgraded from 'city' to 'apartment' for insanely realistic interior reflections!
  let intensity = 1;
  if(lightingPreset === 'morning') { preset = 'dawn'; intensity = 0.8; }
  else if(lightingPreset === 'noon') { preset = 'apartment'; intensity = 1.2; }
  else if(lightingPreset === 'night') { preset = 'sunset'; intensity = 0.5; } // Replaced true 'night' with the stunning Golden Hour 'sunset' preset

  return (
    <>
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 100, display: 'flex', gap: '8px' }}>
        <button 
          className="glass-panel hover-lift"
          style={{ padding: '10px 20px', color: 'white', cursor: 'pointer', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)' }}
          onClick={() => setShowQR(true)}>
          View in AR
        </button>
        <button 
          className="glass-panel hover-lift"
          style={{ padding: '10px 20px', color: 'white', cursor: 'pointer', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.2)' }}
          onClick={() => store.enterVR()}>
          Enter VR
        </button>
      </div>

      {showQR && <QRModal onClose={() => setShowQR(false)} />}

      <Canvas shadows dpr={dpr} camera={{ position: [5, 5, 5], fov: 45 }}>
        {/* Drops pixel ratio if PC is lagging */}
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
        
        <XR store={store}>
          <Suspense fallback={null}>
            {/* BakeShadows prevents engine from recalculating shadowmaps every frame when static */}
            <BakeShadows />
            <Environment preset={preset} background backgroundBlurriness={0.5} environmentIntensity={intensity} />
            
            {/* Soft lighting */}
            <ambientLight intensity={intensity * 0.5} />
            <directionalLight 
              position={[5, 10, 5]} 
              intensity={intensity} 
              castShadow 
              shadow-mapSize={[1024, 1024]}
            />
            
            <WalkEngine />
            <LoadedArchModel />

            <ContactShadows resolution={512} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
            
            {/* Switched to robust OrbitControls for smoother zooming and panning */}
            <OrbitControls 
              makeDefault 
              enableDamping 
              dampingFactor={0.05} 
              maxPolarAngle={Math.PI / 2 + 0.1} 
              minDistance={1}
              maxDistance={100}
            />
          </Suspense>
        </XR>
      </Canvas>
    </>
  );
}
