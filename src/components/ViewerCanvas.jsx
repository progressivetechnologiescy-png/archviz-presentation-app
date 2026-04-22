import React, { useRef, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PointerLockControls, ContactShadows, Html, useFBX, useGLTF, PerformanceMonitor, BakeShadows } from '@react-three/drei';
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

    // Orient the movement direction to match EXACTLY where the camera is looking (full 3D free fly)
    direction.applyQuaternion(state.camera.quaternion);

    // Translate the camera's physical position
    state.camera.position.add(direction);

    // Process Look Direction (Virtual Rotation Pad for Mobile)
    const storeState = useViewerStore.getState();
    if (storeState.lookLeft || storeState.lookRight) {
      const lookSpeed = delta * 1.5;
      // PointerLockControls uses Euler rotation order YXZ
      if (storeState.lookLeft) state.camera.rotation.y += lookSpeed;
      if (storeState.lookRight) state.camera.rotation.y -= lookSpeed;
    }
  });

  return null;
}

// Load FBX Model
function FBXModel({ url }) {
  const fbx = useFBX(url);
  const groupRef = React.useRef();

  React.useEffect(() => {
    if (fbx) {
      fbx.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [fbx]);

  useFrame(() => {
    if (useViewerStore.getState().isTouring && groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={fbx} scale={0.01} position={[0,0,0]} />
    </group>
  );
}

// Load GLTF/GLB Model
function GLTFModel({ url }) {
  const { scene } = useGLTF(url);
  const groupRef = React.useRef();

  React.useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  useFrame(() => {
    if (useViewerStore.getState().isTouring && groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1} position={[0,0,0]} />
    </group>
  );
}

// Parent Router
function LoadedArchModel() {
  const { customFBX, customGLB } = useViewerStore();
  
  // Prioritize GLB for WebGL, fallback to FBX, then default
  const modelUrl = customGLB || customFBX || '/3D FINAL.fbx';
  const isGLTF = modelUrl.toLowerCase().endsWith('.glb') || modelUrl.toLowerCase().endsWith('.gltf');

  return (
    <group key={modelUrl}>
      {isGLTF ? (
        <GLTFModel url={modelUrl} />
      ) : (
        <FBXModel url={modelUrl} />
      )}
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
      <div style={{ position: 'absolute', top: 100, right: 32, zIndex: 100, display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

      <Canvas shadows dpr={dpr} camera={{ position: [0, 1.6, 12], fov: 55 }}>
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
            
            {/* True First-Person Game Camera */}
            <PointerLockControls makeDefault />
          </Suspense>
        </XR>
      </Canvas>
    </>
  );
}
