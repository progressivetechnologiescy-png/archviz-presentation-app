import React, { useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import VirtualRemote from '../components/VirtualRemote';
import { Sun, Moon, Sunrise, Play, Square, MousePointer2, Compass, Move } from 'lucide-react';
import ViewerCanvas from '../components/ViewerCanvas';

const kbdStyle = {
  background: 'rgba(255, 255, 255, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '6px',
  padding: '2px 6px',
  fontSize: '11px',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: '800',
  color: 'white',
  boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
  minWidth: '16px',
  textAlign: 'center',
  display: 'inline-block',
  lineHeight: '1',
  margin: '0 2px'
};

export default function StandaloneView() {
  const { isTouring, toggleTouring, setMovement, controlMode, setControlMode, primaryModel, customGLB, customFBX } = useViewerStore();
  const modelUrl = primaryModel || customGLB || customFBX || '/3D_FINAL.fbx';
  const isSketchfab = modelUrl && modelUrl.includes('sketchfab.com');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (useViewerStore.getState().controlMode !== 'walk') return;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': setMovement('moveForward', true); break;
        case 'KeyA': case 'ArrowLeft': setMovement('moveLeft', true); break;
        case 'KeyS': case 'ArrowDown': setMovement('moveBackward', true); break;
        case 'KeyD': case 'ArrowRight': setMovement('moveRight', true); break;
        case 'ShiftLeft': case 'ShiftRight': setMovement('moveUp', true); break;
        case 'ControlLeft': case 'ControlRight': case 'KeyC': setMovement('moveDown', true); break;
      }
    };

    const handleKeyUp = (e) => {
      if (useViewerStore.getState().controlMode !== 'walk') return;
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': setMovement('moveForward', false); break;
        case 'KeyA': case 'ArrowLeft': setMovement('moveLeft', false); break;
        case 'KeyS': case 'ArrowDown': setMovement('moveBackward', false); break;
        case 'KeyD': case 'ArrowRight': setMovement('moveRight', false); break;
        case 'ShiftLeft': case 'ShiftRight': setMovement('moveUp', false); break;
        case 'ControlLeft': case 'ControlRight': case 'KeyC': setMovement('moveDown', false); break;
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
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', background: '#0a0c10' }}>
      
      {/* 3D Canvas Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <ViewerCanvas />
      </div>

      {/* On-Screen Instructions for active control mode (re-trigger fade animation on mode switch) */}
      {!isSketchfab && (
        <div 
          key={controlMode}
          style={{ 
            position: 'absolute', top: '120px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(10, 12, 16, 0.85)', backdropFilter: 'blur(12px)', padding: '12px 24px', borderRadius: '30px',
            color: 'white', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 5, pointerEvents: 'none',
            border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            animation: 'fadeOutOld 10s ease-in forwards' // Auto-hide after 10 seconds
          }}
        >
          {controlMode === 'orbit' ? (
            <>
              <Compass size={16} style={{ color: 'var(--accent-color, #3b82f6)' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', letterSpacing: '0.5px' }}>
                Drag to orbit. Scroll to zoom. Right-click to pan.
              </span>
            </>
          ) : (
            <>
              <MousePointer2 size={16} style={{ color: 'var(--accent-color, #3b82f6)' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', letterSpacing: '0.5px', display: 'flex', alignItems: 'center' }}>
                Click screen to lock cursor. Use <kbd style={kbdStyle}>W</kbd><kbd style={kbdStyle}>A</kbd><kbd style={kbdStyle}>S</kbd><kbd style={kbdStyle}>D</kbd> or arrows to walk.
              </span>
            </>
          )}
        </div>
      )}

      {!isSketchfab && <VirtualRemote />}

      {/* Minimalist Floating UI overlaying the 3D Canvas */}
        <style>{`
          .interactive-controls-wrapper {
            position: absolute; bottom: 40px; left: 0; right: 0; 
            pointer-events: none; display: flex; justify-content: center; z-index: 10;
          }
          .interactive-controls { 
            display: flex; align-items: center; gap: 24px; padding: 12px 24px; 
            border-radius: 40px; pointer-events: auto;
            box-shadow: 0 24px 64px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.08);
            background: rgba(8, 10, 15, 0.85);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
          }
          .tour-btn { 
            padding: 12px 24px; border-radius: 30px; border: none; 
            cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold;
          }
          
          @media (max-width: 768px) {
            .interactive-controls-wrapper { top: 120px; bottom: auto; }
            .interactive-controls { padding: 8px 16px; border-radius: 30px; }
            .tour-btn { padding: 10px 16px; font-size: 14px; }
          }
        `}</style>

        {!isSketchfab && (
          <div className="interactive-controls-wrapper">
            {/* Main Controls Container */}
            <div className="glass-panel interactive-controls" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              
              {/* Control Mode Segmented Toggle Switch */}
              <div style={{ 
                display: 'flex', 
                gap: '4px', 
                background: 'rgba(255,255,255,0.03)', 
                padding: '4px', 
                borderRadius: '30px', 
                border: '1px solid rgba(255,255,255,0.08)' 
              }}>
                <button 
                  onClick={() => setControlMode('orbit')}
                  className="hover-lift"
                  style={{
                    padding: '10px 18px',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: controlMode === 'orbit' ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: controlMode === 'orbit' ? 'white' : 'rgba(255,255,255,0.45)',
                    border: controlMode === 'orbit' ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                    boxShadow: controlMode === 'orbit' ? '0 8px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 12px var(--accent-glow)' : 'none'
                  }}
                >
                  <Compass size={14} style={{ color: controlMode === 'orbit' ? 'var(--accent-color, #3b82f6)' : 'inherit', transition: 'color 0.3s' }} />
                  <span>3D Orbit</span>
                </button>
                
                <button 
                  onClick={() => setControlMode('walk')}
                  className="hover-lift"
                  style={{
                    padding: '10px 18px',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: controlMode === 'walk' ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: controlMode === 'walk' ? 'white' : 'rgba(255,255,255,0.45)',
                    border: controlMode === 'walk' ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                    boxShadow: controlMode === 'walk' ? '0 8px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 12px var(--accent-glow)' : 'none'
                  }}
                >
                  <Move size={14} style={{ color: controlMode === 'walk' ? 'var(--accent-color, #3b82f6)' : 'inherit', transition: 'color 0.3s' }} />
                  <span>Walk Explorer</span>
                </button>
              </div>

              {/* Vertical Splitter divider inside the panel */}
              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.15)' }} />

              {/* Cinematic Tour Button */}
              <button 
                onClick={toggleTouring}
                className="hover-lift tour-btn"
                style={{ 
                  background: isTouring ? 'rgba(239, 68, 68, 0.2)' : 'white', 
                  color: isTouring ? '#ef4444' : 'black', 
                  boxShadow: isTouring ? 'inset 0 0 0 1px #ef4444' : '0 8px 16px rgba(255,255,255,0.2)'
                }}>
                {isTouring ? <Square size={18}/> : <Play size={18} fill="black" />}
                <span className="tour-btn-text">{isTouring ? 'Stop Tour' : 'Play Cinematic Tour'}</span>
              </button>
              
            </div>
          </div>
        )}

    </div>
  );
}
