import React, { useRef, Suspense, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment, PointerLockControls, ContactShadows, Html, useFBX, useGLTF, PerformanceMonitor, SoftShadows, BakeShadows } from '@react-three/drei';
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
          
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat, index) => {
               let cleanColor = mat.color;
               
               // The "Inverted Colors" Fix:
               // 1. In Three.js, a texture (map) multiplies with the base color. To see the texture perfectly, the base color MUST be white.
               //    Revit often exports mapped materials with a black base color, which turns them invisible.
               // 2. For untextured materials (like dark grey balconies), we MUST preserve the original base color.
               if (mat.map) {
                 cleanColor = new THREE.Color(0xffffff); // Force white so the texture renders naturally
               } else {
                 // Only intervene if an untextured material is mathematically pitch black (export error)
                 if (cleanColor && (cleanColor.r + cleanColor.g + cleanColor.b < 0.05)) {
                   cleanColor = new THREE.Color(0xffffff);
                 }
               }
               
               const pbrMat = new THREE.MeshStandardMaterial({
                 color: cleanColor,
                 map: mat.map || null,
                 normalMap: mat.normalMap || null,
                 roughness: 0.2, // Sleek architectural finish
                 metalness: 0.1, 
                 envMapIntensity: 1.5 // Perfectly reflects the HDRI maps
               });
               
               if (Array.isArray(child.material)) {
                 child.material[index] = pbrMat;
               } else {
                 child.material = pbrMat;
               }
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

// Wrapper for custom JPEG/PNG panoramas to act as HDRI Environment
function CustomEnvironment({ url }) {
  const texture = useLoader(THREE.TextureLoader, url);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return <Environment map={texture} background={false} environmentIntensity={1.2} />;
}

export default function ViewerCanvas() {
  const { lightingPreset, isTouring, customPanorama } = useViewerStore();
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
