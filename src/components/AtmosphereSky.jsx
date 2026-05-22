import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useViewerStore } from '../store/viewerStore';

const SkyShader = {
  vertexShader: `
    varying vec3 vWorldPosition;

    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vWorldPosition;
    uniform vec3 uColorTop;
    uniform vec3 uColorMiddle;
    uniform vec3 uColorBottom;

    void main() {
      // Normalize the vertex height direction to construct a vertical color gradient (-1.0 to 1.0)
      float h = normalize(vWorldPosition).y;
      
      // Calculate split layers for a three-color gradient
      vec3 finalColor;
      if (h > 0.0) {
        finalColor = mix(uColorMiddle, uColorTop, h);
      } else {
        finalColor = mix(uColorMiddle, uColorBottom, -h);
      }

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

export default function AtmosphereSky() {
  const { lightingPreset } = useViewerStore();
  const materialRef = useRef(null);

  // Define premium atmospheric three-color gradient palettes
  const colorPalettes = useMemo(() => ({
    morning: {
      top: new THREE.Color('#0f172a'),    // Deep indigo space
      middle: new THREE.Color('#3b82f6'), // Bright dawn blue
      bottom: new THREE.Color('#fbcfe8')  // Soft pink horizon glow
    },
    noon: {
      top: new THREE.Color('#0284c7'),    // Deep sky blue
      middle: new THREE.Color('#38bdf8'), // Horizon azure
      bottom: new THREE.Color('#f0f9ff')  // Sunlit sky white
    },
    night: { // night maps to the gorgeous Golden Hour 'sunset' preset in ViewerCanvas
      top: new THREE.Color('#1e1b4b'),    // Twilight cosmic purple
      middle: new THREE.Color('#c2410c'), // Warm sunset amber
      bottom: new THREE.Color('#fdba74')  // Horizon burning orange
    }
  }), []);

  // Keep tracking refs for real-time interpolation
  const currentPaletteRef = useRef({
    top: new THREE.Color('#0284c7'),
    middle: new THREE.Color('#38bdf8'),
    bottom: new THREE.Color('#f0f9ff')
  });

  // Initialize WebGL shader uniforms once via useMemo without accessing refs during render
  const uniforms = useMemo(() => ({
    uColorTop: { value: new THREE.Color('#0284c7') },
    uColorMiddle: { value: new THREE.Color('#38bdf8') },
    uColorBottom: { value: new THREE.Color('#f0f9ff') }
  }), []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      const activePreset = lightingPreset || 'noon';
      const targetPalette = colorPalettes[activePreset] || colorPalettes.noon;
      const lerpSpeed = delta * 2.0; // Dynamic, smooth shift transition

      // Interpolate each gradient key color toward the selected preset
      currentPaletteRef.current.top.lerp(targetPalette.top, lerpSpeed);
      currentPaletteRef.current.middle.lerp(targetPalette.middle, lerpSpeed);
      currentPaletteRef.current.bottom.lerp(targetPalette.bottom, lerpSpeed);

      // Update shader uniforms
      materialRef.current.uniforms.uColorTop.value.copy(currentPaletteRef.current.top);
      materialRef.current.uniforms.uColorMiddle.value.copy(currentPaletteRef.current.middle);
      materialRef.current.uniforms.uColorBottom.value.copy(currentPaletteRef.current.bottom);
    }
  });

  return (
    <mesh scale={[-1, 1, 1]}> {/* Invert sphere normals to render internally */}
      <sphereGeometry args={[120, 32, 15]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={SkyShader.vertexShader}
        fragmentShader={SkyShader.fragmentShader}
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
      />
    </mesh>
  );
}
