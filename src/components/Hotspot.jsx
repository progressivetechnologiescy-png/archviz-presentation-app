import React, { useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useViewerStore } from '../store/viewerStore';

// Fresnel Outline Shader: Creates a glowing holographic rim effect reacting to the camera angle
const FresnelShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uGlowPower;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // Fresnel glow equation: intense at the edges (grazing angles), transparent at center
      float intensity = pow(1.0 - max(dot(normal, viewDir), 0.0), uGlowPower);
      
      gl_FragColor = vec4(uColor, intensity);
    }
  `
};

export default function Hotspots() {
  const { camera } = useThree();
  const accentColor = useViewerStore(state => state.accentColor || '#3b82f6');
  
  // State to track camera interpolation
  const [lerpTarget, setLerpTarget] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  
  const HOTSPOT_DATA = [
    {
      id: 'pool',
      name: 'Swimming Pool',
      pos: [0, 0.4, 9.0],
      cameraPos: [0, 1.8, 13.0],
      lookAt: [0, 1.2, 7.0]
    },
    {
      id: 'living',
      name: 'Living Room',
      pos: [0.3, 0.4, 1.5],
      cameraPos: [0.3, 1.7, 3.5],
      lookAt: [0.3, 1.6, -1.0]
    },
    {
      id: 'kitchen',
      name: 'Kitchen & Dining',
      pos: [-4.0, 0.4, 0.5],
      cameraPos: [-2.5, 1.7, 0.5],
      lookAt: [-6.0, 1.6, 0.5]
    },
    {
      id: 'master',
      name: 'Master Suite',
      pos: [-4.0, 4.0, -0.5],
      cameraPos: [-2.2, 5.2, -0.5],
      lookAt: [-6.0, 4.8, -0.5]
    },
    {
      id: 'office',
      name: 'Office & Study',
      pos: [4.0, 0.4, 1.0],
      cameraPos: [2.5, 1.7, 1.0],
      lookAt: [5.5, 1.6, 1.0]
    }
  ];

  useFrame((state, delta) => {
    // Animate the camera slide if a teleport is triggered
    if (lerpTarget) {
      const step = delta * 3.5; // Smooth cinematic velocity
      
      // Interpolate camera position
      camera.position.lerp(lerpTarget.pos, step);
      
      // Interpolate camera look direction
      const currentLook = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
      const targetLook = lerpTarget.lookAt;
      currentLook.lerp(targetLook, step);
      
      // Apply the rotation look-at
      camera.lookAt(currentLook);

      // Stop lerping when exceptionally close
      if (camera.position.distanceTo(lerpTarget.pos) < 0.05) {
        camera.position.copy(lerpTarget.pos);
        setLerpTarget(null);
      }
    }
  });

  const handleHotspotClick = (h) => {
    // Unlock standard PointerLockControls briefly so user has cursor control
    document.exitPointerLock?.();
    
    // Begin camera glide
    setLerpTarget({
      pos: new THREE.Vector3(...h.cameraPos),
      lookAt: new THREE.Vector3(...h.lookAt)
    });
  };

  return (
    <group>
      {HOTSPOT_DATA.map((h) => {
        const isHovered = hoveredId === h.id;
        
        return (
          <group key={h.id} position={h.pos}>
            {/* Fresnel Pulsing Ring */}
            <mesh
              onClick={() => handleHotspotClick(h)}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(h.id);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHoveredId(null);
                document.body.style.cursor = 'default';
              }}
            >
              <torusGeometry args={[0.3, 0.03, 16, 64]} />
              <shaderMaterial
                vertexShader={FresnelShader.vertexShader}
                fragmentShader={FresnelShader.fragmentShader}
                transparent={true}
                depthWrite={false}
                uniforms={{
                  uColor: { value: new THREE.Color(isHovered ? '#ffffff' : accentColor) },
                  uGlowPower: { value: isHovered ? 1.5 : 2.5 }
                }}
              />
            </mesh>

            {/* Pulsing Floor shadow/wave */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
              <ringGeometry args={[0.05, 0.45, 32]} />
              <meshBasicMaterial 
                color={accentColor} 
                transparent={true} 
                opacity={0.3} 
                depthWrite={false} 
              />
            </mesh>

            {/* Glowing HTML Label */}
            <Html
              center
              distanceFactor={8}
              position={[0, 0.6, 0]}
              style={{
                pointerEvents: 'none',
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                opacity: isHovered ? 1 : 0.6,
                transform: `scale(${isHovered ? 1.1 : 1})`
              }}
            >
              <div style={{
                background: isHovered ? 'rgba(255, 255, 255, 0.95)' : 'rgba(10, 12, 16, 0.75)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: `1px solid ${isHovered ? '#ffffff' : 'rgba(255,255,255,0.15)'}`,
                boxShadow: isHovered ? '0 12px 28px rgba(255,255,255,0.25)' : '0 8px 24px rgba(0,0,0,0.5)',
                color: isHovered ? '#000000' : '#ffffff',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'Outfit, sans-serif'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isHovered ? '#000000' : accentColor,
                  animation: 'hotspotRipple 1.6s infinite ease-out'
                }} />
                {h.name}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
