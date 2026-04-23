import React, { Suspense, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment, PointerLockControls, ContactShadows, Html, useProgress, useFBX, useGLTF, PerformanceMonitor, SoftShadows, BakeShadows } from '@react-three/drei';
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
    const storeState = useViewerStore.getState();

    // Process Look Direction (Virtual Rotation Pad for Mobile) - MUST be before early return!
    if (storeState.lookLeft || storeState.lookRight) {
      const lookSpeed = delta * 1.5;
      // PointerLockControls uses Euler rotation order YXZ
      if (storeState.lookLeft) state.camera.rotation.y += lookSpeed;
      if (storeState.lookRight) state.camera.rotation.y -= lookSpeed;
    }

    if (!storeState.moveForward && !storeState.moveBackward && !storeState.moveLeft && !storeState.moveRight && !storeState.moveUp && !storeState.moveDown) return;

    // Calculate planar movement intent
    frontVector.set(0, 0, Number(storeState.moveBackward) - Number(storeState.moveForward));
    sideVector.set(Number(storeState.moveLeft) - Number(storeState.moveRight), 0, 0);

    // Orient the X/Z movement direction to match where the camera is looking
    direction.subVectors(frontVector, sideVector);
    direction.applyQuaternion(state.camera.quaternion);

    // Add global Up/Down (Y-axis) movement completely independent of camera look angle
    direction.y += Number(storeState.moveUp) - Number(storeState.moveDown);

    // Normalize and apply speed
    direction.normalize().multiplyScalar(speed * delta);

    // Translate the camera's physical position
    state.camera.position.add(direction);
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
          
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat) => {
               // 1. DESTROY CORRUPTED TEXTURES
               // Revit FBX exports often include broken or missing diffuse maps that render as a pitch-black overlay.
               // By stripping the map, we reveal the TRUE underlying material colors (e.g., white walls, dark balconies).
               mat.map = null;
               
               // 2. Apply photorealistic PBR lighting interaction to the true colors
               if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
                   mat.roughness = 0.2; // Clean architectural finish
                   mat.metalness = 0.1; 
                   mat.envMapIntensity = 1.0; // Reflect the sky realistically
               } else {
                   // Inject basic PBR traits for legacy materials
                   mat.roughness = 0.2;
                   mat.metalness = 0.1;
                   mat.envMapIntensity = 1.0;
               }
               
               mat.needsUpdate = true;
            });
          }
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
  const { customFBX, customGLB, primaryModel } = useViewerStore();
  
  // Prioritize newest uploaded model, fallback to GLB, then FBX, then default
  const modelUrl = primaryModel || customGLB || customFBX || '/3D_FINAL.fbx';
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

// Wrapper for custom JPEG/PNG panoramas to act as HDRI Environment
function CustomEnvironment({ url }) {
  const texture = useLoader(THREE.TextureLoader, url);
  const clonedTexture = useMemo(() => {
    const clone = texture.clone();
    clone.mapping = THREE.EquirectangularReflectionMapping;
    clone.colorSpace = THREE.SRGBColorSpace;
    clone.needsUpdate = true;
    return clone;
  }, [texture]);
  
  return <Environment map={clonedTexture} background={false} environmentIntensity={1.2} />;
}

// Global 3D Loader
function ModelLoader() {
  const { progress } = useProgress();
  return (
    <Html center zIndexRange={[100, 0]}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10, 12, 16, 0.8)', padding: '24px 48px', borderRadius: '24px',
        backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)',
        color: 'white', whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Loading 3D Model</div>
        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ marginTop: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{progress.toFixed(0)}% Complete</div>
      </div>
    </Html>
  );
}

export default function ViewerCanvas() {
  const { lightingPreset, customPanorama } = useViewerStore();
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
          <Suspense fallback={<ModelLoader />}>
            {/* Reverted SoftShadows to BakeShadows to prevent shader crash */}
            <BakeShadows />
            
            {customPanorama ? (
              <CustomEnvironment url={customPanorama} />
            ) : (
              <Environment preset={preset} background={false} environmentIntensity={intensity} />
            )}
            
            {/* Failsafe, brilliant lighting setup so no model can ever be black */}
            <ambientLight intensity={intensity * 1.5} />
            <hemisphereLight skyColor="#ffffff" groundColor="#666666" intensity={intensity * 1.5} />
            <directionalLight 
              position={[20, 50, 20]} 
              intensity={intensity * 2.5} 
              castShadow 
              shadow-mapSize={[1024, 1024]}
              shadow-bias={-0.001}
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
