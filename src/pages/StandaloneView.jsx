import React, { useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import VirtualRemote from '../components/VirtualRemote';
import { Sun, Moon, Sunrise, Play, Square, Image as ImageIcon } from 'lucide-react';
import ViewerCanvas from '../components/ViewerCanvas';

export default function StandaloneView({ isNested }) {
  const { lightingPreset, setLightingPreset, isTouring, toggleTouring, activeMaterial, setActiveMaterial, setMovement } = useViewerStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': setMovement('moveForward', true); break;
        case 'KeyA': case 'ArrowLeft': setMovement('moveLeft', true); break;
        case 'KeyS': case 'ArrowDown': setMovement('moveBackward', true); break;
        case 'KeyD': case 'ArrowRight': setMovement('moveRight', true); break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': setMovement('moveForward', false); break;
        case 'KeyA': case 'ArrowLeft': setMovement('moveLeft', false); break;
        case 'KeyS': case 'ArrowDown': setMovement('moveBackward', false); break;
        case 'KeyD': case 'ArrowRight': setMovement('moveRight', false); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setMovement]);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
      
      {/* 3D Canvas Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <ViewerCanvas />
      </div>

      <VirtualRemote />

      {/* Glassmorphic Side Panel UI */}
      <div className="glass-panel hover-lift" style={{ 
        width: '320px', 
        height: `calc(100% - ${isNested ? '120px' : '40px'})`, 
        marginTop: isNested ? '100px' : '20px',
        marginLeft: '20px',
        zIndex: 10, 
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        pointerEvents: 'auto'
      }}>
        {!isNested && (
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Property Showcase</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Premium Interactive Model Viewer</p>
          </div>
        )}

        {/* Lighting Controls */}
        <div>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', color: 'var(--text-secondary)' }}>Lighting Preset</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setLightingPreset('morning')}
              style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: `1px solid ${lightingPreset === 'morning' ? 'var(--accent-color)' : 'var(--border-color)'}`, background: lightingPreset === 'morning' ? 'var(--accent-glow)' : 'transparent', color: 'white', cursor: 'pointer' }}>
              <Sunrise size={18} style={{ margin: '0 auto' }} />
            </button>
            <button 
              onClick={() => setLightingPreset('noon')}
              style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: `1px solid ${lightingPreset === 'noon' ? 'var(--accent-color)' : 'var(--border-color)'}`, background: lightingPreset === 'noon' ? 'var(--accent-glow)' : 'transparent', color: 'white', cursor: 'pointer' }}>
              <Sun size={18} style={{ margin: '0 auto' }} />
            </button>
            <button 
              onClick={() => setLightingPreset('night')}
              style={{ flex: 1, padding: '12px 0', borderRadius: '8px', border: `1px solid ${lightingPreset === 'night' ? 'var(--accent-color)' : 'var(--border-color)'}`, background: lightingPreset === 'night' ? 'var(--accent-glow)' : 'transparent', color: 'white', cursor: 'pointer' }}>
              <Moon size={18} style={{ margin: '0 auto' }} />
            </button>
          </div>
        </div>

        {/* Material Swaps */}
        <div>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', color: 'var(--text-secondary)' }}>Finishes</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['marble', 'wood', 'concrete'].map(mat => (
              <button 
                key={mat}
                onClick={() => setActiveMaterial(mat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: `1px solid ${activeMaterial === mat ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  background: activeMaterial === mat ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}>
                {mat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flexGrow: 1 }}></div>

        {/* Cinematic Tour Button */}
        <button 
          onClick={toggleTouring}
          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: isTouring ? '#ef4444' : 'var(--text-primary)', color: isTouring ? 'white' : 'var(--bg-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}>
          {isTouring ? <Square size={18}/> : <Play size={18} />}
          {isTouring ? 'Stop Tour' : 'Start Cinematic Tour'}
        </button>

      </div>
    </div>
  );
}
