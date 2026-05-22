import React, { Suspense, useState, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment, PointerLockControls, OrbitControls, ContactShadows, Html, useProgress, useFBX, useGLTF, PerformanceMonitor, SoftShadows, BakeShadows } from '@react-three/drei';
import { XR, createXRStore } from '@react-three/xr';
import { useViewerStore } from '../store/viewerStore';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import QRModal from './QRModal';
import AtmosphereSky from './AtmosphereSky';
import { AlertTriangle, X } from 'lucide-react';


// Reusable helper to dynamically upgrade basic materials to premium PBR MeshPhysicalMaterial settings
function upgradeMaterial(child, isFBX = false) {
  if (!child.isMesh || !child.material) return;
  
  const name = (child.name || '').toLowerCase();
  
  const mats = Array.isArray(child.material) ? child.material : [child.material];
  
  mats.forEach((mat, index) => {
    const matName = (mat.name || '').toLowerCase();
    
    // Categorize surface types based on name descriptors
    const isGlass = name.includes('glass') || matName.includes('glass') || name.includes('window') || matName.includes('window') || name.includes('transp') || matName.includes('transp') || name.includes('glaz') || matName.includes('glaz');
    const isMetal = name.includes('metal') || matName.includes('metal') || name.includes('steel') || matName.includes('aluminum') || name.includes('chrome') || name.includes('brass') || name.includes('iron') || matName.includes('steel') || matName.includes('metal');
    const isFloor = name.includes('floor') || matName.includes('floor') || name.includes('tile') || name.includes('marble') || name.includes('parquet') || name.includes('granite') || name.includes('slabs') || matName.includes('tile') || matName.includes('floor');
    const isWood = name.includes('wood') || matName.includes('wood') || name.includes('timber') || name.includes('oak') || name.includes('walnut') || name.includes('furniture') || matName.includes('wood') || matName.includes('timber');

    // Upgrade to Physical Material for premium reflections and light interaction
    let physicalMat = mat;
    if (!mat.isMeshPhysicalMaterial) {
      physicalMat = new THREE.MeshPhysicalMaterial({
        color: mat.color ? mat.color.clone() : new THREE.Color('#ffffff'),
        map: isFBX ? null : mat.map, // Strip broken/corrupted diffuse maps for FBX models to restore true white/light surfaces
        roughness: 0.4,
        metalness: 0.1,
        transparent: mat.transparent || false,
        opacity: mat.opacity !== undefined ? mat.opacity : 1.0,
        side: mat.side
      });
      
      // Assign back to mesh
      if (Array.isArray(child.material)) {
        child.material[index] = physicalMat;
      } else {
        child.material = physicalMat;
      }
    } else if (isFBX) {
      physicalMat.map = null; // Strip broken/corrupted diffuse maps for FBX models to restore true white/light surfaces
    }

    // Apply photorealistic lighting metrics based on categorized surface
    if (isGlass) {
      physicalMat.transparent = true;
      physicalMat.opacity = 0.25;
      physicalMat.transmission = 0.95;
      physicalMat.roughness = 0.02;
      physicalMat.metalness = 0.05;
      physicalMat.thickness = 0.4;
      physicalMat.ior = 1.5;
    } else if (isFloor) {
      physicalMat.roughness = 0.12;
      physicalMat.metalness = 0.02;
      physicalMat.clearcoat = 1.0;
      physicalMat.clearcoatRoughness = 0.08;
    } else if (isMetal) {
      physicalMat.roughness = 0.2;
      physicalMat.metalness = 0.95;
    } else if (isWood) {
      physicalMat.roughness = 0.45;
      physicalMat.metalness = 0.0;
      physicalMat.clearcoat = 0.15;
      physicalMat.clearcoatRoughness = 0.2;
    } else {
      // General architectural surfaces (walls, plaster)
      physicalMat.roughness = 0.5;
      physicalMat.metalness = 0.0;
    }
    
    // Boost sky/apartment HDRI environment reflection impact
    physicalMat.envMapIntensity = 1.8;
    physicalMat.needsUpdate = true;
  });
}
const walkVectors = {
  direction: new THREE.Vector3(),
  frontVector: new THREE.Vector3(),
  sideVector: new THREE.Vector3()
};

function WalkEngine() {
  const speed = 12; // Adjusted slightly for a more stable walking pace
  const controlMode = useViewerStore(state => state.controlMode);
  
  const collisionMeshesRef = React.useRef([]);
  const hasLandedRef = React.useRef(false);
  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
  const downVector = React.useMemo(() => new THREE.Vector3(0, -1, 0), []);
  let frameCount = 0;

  // Reset landing state when walk mode is deactivated
  React.useEffect(() => {
    if (controlMode !== 'walk') {
      hasLandedRef.current = false;
    }
  }, [controlMode]);

  useFrame((state, delta) => {
    const storeState = useViewerStore.getState();
    if (storeState.controlMode !== 'walk') return;

    // Process Look Direction (Virtual Rotation Pad for Mobile)
    if (storeState.lookLeft || storeState.lookRight) {
      const lookSpeed = delta * 1.5;
      if (storeState.lookLeft) state.camera.rotation.y += lookSpeed;
      if (storeState.lookRight) state.camera.rotation.y -= lookSpeed;
    }

    // Cache collision meshes every 60 frames to keep raycast traversal ultra-fast
    frameCount++;
    if (frameCount % 60 === 1 || collisionMeshesRef.current.length === 0) {
      const meshes = [];
      state.scene.traverse((child) => {
        // Collect solid architectural elements, ignoring helper and sky objects
        if (child.isMesh && child.name !== 'Sky' && !child.name.includes('Helper') && child.visible) {
          meshes.push(child);
        }
      });
      collisionMeshesRef.current = meshes;
    }

    const hasMovementInput = storeState.moveForward || storeState.moveBackward || storeState.moveLeft || storeState.moveRight || storeState.moveUp || storeState.moveDown;

    // Apply gravity floor snapping if not actively flying up/down
    const isActivelyFlying = storeState.moveUp || storeState.moveDown;
    if (!isActivelyFlying && collisionMeshesRef.current.length > 0) {
      const playerPos = state.camera.position.clone();
      // Ray origin starts 2 meters above player head to allow snaps onto floors/staircases
      const rayOrigin = new THREE.Vector3(playerPos.x, playerPos.y + 2, playerPos.z);
      raycaster.set(rayOrigin, downVector);
      const intersections = raycaster.intersectObjects(collisionMeshesRef.current, true);

      if (intersections.length > 0) {
        const firstFloorIntersection = intersections.find(hit => {
          // If we haven't landed yet, accept any surface below the ray origin that is flat-ish
          if (!hasLandedRef.current) {
            // Must be below player head + 2m
            if (hit.point.y > playerPos.y + 1.8) return false;
          } else {
            // Strictly reject surfaces that require a step-up of more than 0.4m (eye level 1.6m - 0.4m = 1.2m below camera)
            if (hit.point.y > playerPos.y - 1.2) return false;
          }
          
          // Avoid snapping onto glass ceilings/walls or vertical elements
          if (hit.face) {
            const norm = hit.face.normal.clone();
            norm.transformDirection(hit.object.matrixWorld);
            return norm.y > 0.7; // strictly flat or sloped upward surfaces
          }
          return true;
        });

        if (firstFloorIntersection) {
          const floorY = firstFloorIntersection.point.y;
          const targetY = floorY + 1.6; // 1.6m is standard eye level
          
          if (!hasLandedRef.current) {
            // Hard snap on first frame/landing to prevent delayed drop
            state.camera.position.y = targetY;
            hasLandedRef.current = true;
          } else {
            // Smoothly drop or climb steps (gravity feeling)
            state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.2);
          }
        }
      }
    }

    if (!hasMovementInput) return;

    // Calculate planar movement intent
    walkVectors.frontVector.set(0, 0, Number(storeState.moveBackward) - Number(storeState.moveForward));
    walkVectors.sideVector.set(Number(storeState.moveLeft) - Number(storeState.moveRight), 0, 0);

    // Orient motion relative to current camera heading
    walkVectors.direction.subVectors(walkVectors.frontVector, walkVectors.sideVector);
    walkVectors.direction.applyQuaternion(state.camera.quaternion);

    // Keep horizontal movement purely planar (X-Z plane)
    walkVectors.direction.y = 0;

    // Add global Up/Down vertical motion when keys are explicitly pressed
    walkVectors.direction.y += Number(storeState.moveUp) - Number(storeState.moveDown);

    // Normalize speed
    walkVectors.direction.normalize().multiplyScalar(speed * delta);

    // Wall Collision Raycasting (Horizontal sliding physics)
    if (collisionMeshesRef.current.length > 0 && !isActivelyFlying) {
      const horizontalDir = walkVectors.direction.clone();
      horizontalDir.y = 0; // only detect horizontal blockages
      const moveDistance = horizontalDir.length();

      if (moveDistance > 0.001) {
        horizontalDir.normalize();
        // Cast ray at human waist level (approx 0.8 meters below eye level)
        const rayOrigin = new THREE.Vector3(
          state.camera.position.x,
          state.camera.position.y - 0.8,
          state.camera.position.z
        );
        raycaster.set(rayOrigin, horizontalDir);
        const intersections = raycaster.intersectObjects(collisionMeshesRef.current, true);

        const wallPadding = 0.45; // prevent camera clipping through wall thickness
        if (intersections.length > 0 && intersections[0].distance < moveDistance + wallPadding) {
          const hit = intersections[0];
          const hitNormal = hit.face.normal.clone();
          // Transform local normal to world coordinates correctly
          hitNormal.transformDirection(hit.object.matrixWorld);
          hitNormal.y = 0;
          hitNormal.normalize();

          // Calculate sliding vector (subtract projection into wall normal)
          const dotProduct = walkVectors.direction.dot(hitNormal);
          if (dotProduct < 0) {
            walkVectors.direction.sub(hitNormal.multiplyScalar(dotProduct));
          }
        }
      }
    }

    // Apply movement translation
    state.camera.position.add(walkVectors.direction);

    // Update active 3D location name based on spatial boundaries in first-person mode
    const pos = state.camera.position;
    let currentArea = 'Exterior Plaza';

    if (pos.y < 3.5) {
      // Ground floor
      if (pos.z > 6) {
        currentArea = 'Swimming Pool & Ground Level Terrace';
      } else if (pos.x < -2) {
        currentArea = 'Kitchen & Dining Space';
      } else if (pos.x > 2) {
        currentArea = 'Office & Guest Study';
      } else {
        currentArea = 'Spacious Living Room';
      }
    } else {
      // Upper floor
      if (pos.z > 6.5) {
        currentArea = 'First-Floor Outdoor Solarium';
      } else if (pos.x < -1) {
        currentArea = 'Master Bedroom Suite';
      } else if (pos.x > 1) {
        currentArea = 'Secondary Bedroom & Bath';
      } else {
        currentArea = 'Upper Lobby Corridor';
      }
    }

    if (storeState.active3DLocationName !== currentArea) {
      useViewerStore.setState({ active3DLocationName: currentArea });
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
          
          // Apply dynamic PBR upgrades
          upgradeMaterial(child, true);
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
          
          // Apply dynamic PBR upgrades
          upgradeMaterial(child);
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

// Load OBJ Model
function OBJModel({ url }) {
  const obj = useLoader(OBJLoader, url);
  const groupRef = React.useRef();

  React.useEffect(() => {
    if (obj) {
      obj.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Apply dynamic PBR upgrades
          upgradeMaterial(child);
        }
      });
    }
  }, [obj]);

  useFrame(() => {
    if (useViewerStore.getState().isTouring && groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={obj} scale={0.01} position={[0,0,0]} />
    </group>
  );
}

// Parent Router
function LoadedArchModel() {
  const { customFBX, customGLB, primaryModel } = useViewerStore();
  
  // Prioritize newest uploaded model, fallback to GLB, then FBX, then default
  const modelUrl = primaryModel || customGLB || customFBX || '/3D_FINAL.fbx';
  const isGLTF = modelUrl.toLowerCase().endsWith('.glb') || modelUrl.toLowerCase().endsWith('.gltf');
  const isOBJ = modelUrl.toLowerCase().endsWith('.obj');

  return (
    <group key={modelUrl}>
      {isGLTF ? (
        <GLTFModel url={modelUrl} />
      ) : isOBJ ? (
        <OBJModel url={modelUrl} />
      ) : (
        <FBXModel url={modelUrl} />
      )}
    </group>
  );
}

const store = createXRStore();

// Poly Haven premium lightweight CC0 1K HDRIs for hyper-realistic lighting & reflections
const HDR_MAPS = {
  morning: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kiara_1_dawn_1k.hdr',
  noon: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr',
  night: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/sunset_fairway_1k.hdr'
};

// Fail-safe boundary: degrades to local Drei presets if network/CDN fails
class EnvironmentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn("HDR environment map failed to load, falling back to local built-in preset:", error);
  }
  render() {
    if (this.state.hasError) {
      return <Environment preset={this.props.preset} background={false} environmentIntensity={this.props.intensity} />;
    }
    return this.props.children;
  }
}

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
  const { lightingPreset, customPanorama, controlMode, primaryModel, customGLB, customFBX } = useViewerStore();
  // Dynamic scaling for smoothness
  const [dpr, setDpr] = useState(1.5);
  const [showQR, setShowQR] = useState(false);
  const [vrError, setVrError] = useState(false);

  // Determine HDRI Environment mapping
  let preset = 'apartment'; // Upgraded from 'city' to 'apartment' for insanely realistic interior reflections!
  let intensity = 1;
  if(lightingPreset === 'morning') { preset = 'dawn'; intensity = 0.8; }
  else if(lightingPreset === 'noon') { preset = 'apartment'; intensity = 1.2; }
  else if(lightingPreset === 'night') { preset = 'sunset'; intensity = 0.5; } // Replaced true 'night' with the stunning Golden Hour 'sunset' preset

  const hdrUrl = HDR_MAPS[lightingPreset] || HDR_MAPS.noon;

  const modelUrl = primaryModel || customGLB || customFBX || '/3D_FINAL.fbx';
  const isSketchfab = modelUrl && modelUrl.includes('sketchfab.com');

  let sketchfabEmbedUrl = '';
  if (isSketchfab) {
    const parts = modelUrl.split('/');
    const lastPart = parts[parts.length - 1] || parts[parts.length - 2] || '';
    const idMatch = lastPart.match(/[a-f0-9]{32}/i);
    const modelId = idMatch ? idMatch[0] : lastPart;
    sketchfabEmbedUrl = `https://sketchfab.com/models/${modelId}/embed?autostart=1&internal=1&tracking=0&ui_ar=1&ui_help=0&ui_vr=1&ui_settings=1&ui_inspector=0&ui_annotations=1&ui_animations=1&camera=0`;
  }

  if (isSketchfab) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1, background: '#0a0c10' }}>
        <iframe
          title="Sketchfab 3D Model"
          src={sketchfabEmbedUrl}
          frameBorder="0"
          allowFullScreen
          mozallowfullscreen="true"
          webkitallowfullscreen="true"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    );
  }

  return (
    <>
      <div style={{ position: 'absolute', top: 100, right: 32, zIndex: 100, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          className="hover-lift"
          style={{ 
            padding: '12px 24px', 
            color: 'white', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            borderRadius: '12px',
            background: 'rgba(16, 18, 26, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(30px) saturate(210%)',
            WebkitBackdropFilter: 'blur(30px) saturate(210%)',
            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.color = '#0a0c10';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(16, 18, 26, 0.65)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.22)';
          }}
          onClick={() => setShowQR(true)}>
          View in AR
        </button>
        <button 
          className="hover-lift"
          style={{ 
            padding: '12px 24px', 
            color: 'white', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            borderRadius: '12px',
            background: 'rgba(16, 18, 26, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(30px) saturate(210%)',
            WebkitBackdropFilter: 'blur(30px) saturate(210%)',
            transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.color = '#0a0c10';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.22)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(16, 18, 26, 0.65)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.22)';
          }}
          onClick={async () => {
            try {
              const session = await store.enterVR();
              if (!session) {
                setVrError(true);
              }
            } catch (err) {
              console.error("VR Error:", err);
              setVrError(true);
            }
          }}>
          Enter VR
        </button>
      </div>

      {showQR && <QRModal onClose={() => setShowQR(false)} />}

      {vrError && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(5, 7, 10, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          <div 
            className="dark-obsidian-panel" 
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'rgba(18, 20, 28, 0.85)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '32px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setVrError(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255, 255, 255, 0.7)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
            >
              <X size={16} />
            </button>

            {/* Alert Icon */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              borderRadius: '50%',
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
            }}>
              <AlertTriangle size={32} color="#ef4444" />
            </div>

            {/* Text Header */}
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '22px',
              fontWeight: '700',
              color: '#ffffff',
              letterSpacing: '-0.3px'
            }}>
              VR Mode Not Supported
            </h3>

            {/* Body Info */}
            <p style={{
              margin: '0 0 24px 0',
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.75)'
            }}>
              WebXR Immersive VR is not supported on this browser or hardware setup. 
              <br /><br />
              To experience this premium presentation in full interactive Virtual Reality:
            </p>

            {/* List Box */}
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              padding: '16px 20px',
              textAlign: 'left',
              marginBottom: '28px',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>1.</span>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4' }}>
                  Use a dedicated VR headset browser, such as the <strong>Meta Quest Browser</strong> on Oculus Quest 2 / 3 / Pro, or <strong>Apple Vision Pro</strong> Safari.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>2.</span>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.4' }}>
                  If testing on a desktop or laptop, install the <strong>WebXR API Emulator</strong> extension from the Chrome Web Store to simulate camera tracks and headsets.
                </span>
              </div>
            </div>

            {/* Got It Button */}
            <button
              onClick={() => setVrError(false)}
              className="hover-lift"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--accent-color)',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              Understand & Dismiss
            </button>
          </div>
        </div>
      )}

      <Canvas shadows dpr={dpr} camera={{ position: [0, 1.6, 12], fov: 55 }}>
        {/* Drops pixel ratio if PC is lagging */}
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
        
        <XR store={store}>
          <Suspense fallback={<ModelLoader />}>
            {/* Reverted SoftShadows to BakeShadows to prevent shader crash */}
            <BakeShadows />
            {!customPanorama && <AtmosphereSky />}
            
            {customPanorama ? (
              <CustomEnvironment url={customPanorama} />
            ) : (
              <EnvironmentErrorBoundary key={hdrUrl} preset={preset} intensity={intensity}>
                <Environment files={hdrUrl} background={false} environmentIntensity={intensity} />
              </EnvironmentErrorBoundary>
            )}
            
            {/* Photorealistic, highly balanced three-point PBR lighting setup */}
            <ambientLight intensity={intensity * 0.35} />
            <hemisphereLight skyColor="#e0f2fe" groundColor="#0f172a" intensity={intensity * 0.4} />
            <directionalLight 
              position={[15, 45, 15]} 
              intensity={intensity * 2.0} 
              castShadow 
              shadow-mapSize={[2048, 2048]} // Higher shadow map resolution for razor-sharp shadows
              shadow-bias={-0.0001} // Fine-tuned bias to eliminate shadow acne and staircase patterns
            >
              <orthographicCamera attach="shadow-camera" args={[-40, 40, 40, -40, 0.1, 150]} />
            </directionalLight>
            
            <WalkEngine />
            <LoadedArchModel />

            {/* Gorgeous high-fidelity contact shadows on the floor/ground */}
            <ContactShadows resolution={1024} scale={30} blur={2.5} opacity={0.65} far={15} color="#0b0f19" />
            
            {/* Conditional Camera Controls depending on controlMode */}
            {controlMode === 'walk' ? (
              <PointerLockControls makeDefault />
            ) : (
              <OrbitControls 
                makeDefault 
                enableDamping 
                dampingFactor={0.05} 
                maxPolarAngle={Math.PI / 2 - 0.05} // prevent camera dipping below floor
                minDistance={2} 
                maxDistance={45} 
                target={[0, 1.5, 0]} // focus center
              />
            )}
          </Suspense>
        </XR>
      </Canvas>
    </>
  );
}
