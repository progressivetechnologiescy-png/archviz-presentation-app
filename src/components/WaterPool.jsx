import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Vertex Shader: Procedural wave height displacement
const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Animate wave height displacement with layered sine/cosine waves
    float elevation = sin(modelPosition.x * 2.0 + uTime * 1.5) * 0.04
                    + cos(modelPosition.z * 1.5 + uTime * 1.2) * 0.03
                    + sin((modelPosition.x + modelPosition.z) * 3.0 + uTime * 2.0) * 0.015;
    
    modelPosition.y += elevation;
    vElevation = elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
  }
`;

// Fragment Shader: High-fashion shimmering aquamarine caustics and light refraction
const fragmentShader = `
  uniform float uTime;
  uniform vec3 uDepthColor;
  uniform vec3 uSurfaceColor;
  uniform float uColorOffset;
  uniform float uColorMultiplier;
  
  varying vec2 vUv;
  varying float vElevation;

  // Simple procedural noise for light caustics
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    // Dynamic time-based scrolling coordinate systems for intersecting ripple layers
    vec2 uv1 = vUv * 12.0 + vec2(uTime * 0.08, uTime * 0.05);
    vec2 uv2 = vUv * 16.0 - vec2(uTime * 0.06, -uTime * 0.09);
    
    // Wave ripple math simulating light refraction patterns (caustics)
    float ripple1 = sin(uv1.x + sin(uv1.y)) * 0.5 + 0.5;
    float ripple2 = cos(uv2.x - cos(uv2.y)) * 0.5 + 0.5;
    
    // Intersecting interference wave values
    float caustics = ripple1 * ripple2;
    caustics = pow(caustics, 4.0); // Sharpen the caustics lines for high contrast
    
    // Smooth transition from deep ocean blue to sparkling turquoise
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 waterColor = mix(uDepthColor, uSurfaceColor, mixStrength);
    
    // Inject glowing white caustics to water surface
    vec3 finalColor = mix(waterColor, vec3(1.0, 1.0, 1.0), caustics * 0.35);
    
    // Premium transparency: water surface is slightly transparent with high metallic fresnel feel
    gl_FragColor = vec4(finalColor, 0.78);
  }
`;

export default function WaterPool({ position = [0, 0.04, 10.5], scale = [14, 8, 1] }) {
  const materialRef = useRef(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh position={position} scale={scale} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1, 1, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={true}
        side={THREE.DoubleSide}
        uniforms={{
          uTime: { value: 0 },
          uDepthColor: { value: new THREE.Color('#0284c7') },   // Deep premium cyan
          uSurfaceColor: { value: new THREE.Color('#38bdf8') }, // Shallow sparkling blue
          uColorOffset: { value: 0.08 },
          uColorMultiplier: { value: 6.0 }
        }}
      />
    </mesh>
  );
}
