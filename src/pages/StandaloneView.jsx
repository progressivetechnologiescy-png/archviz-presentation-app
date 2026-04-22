import React, { useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import VirtualRemote from '../components/VirtualRemote';
import { Sun, Moon, Sunrise, Play, Square, MousePointer2 } from 'lucide-react';
import ViewerCanvas from '../components/ViewerCanvas';

export default function StandaloneView({ isNested }) {
  const { lightingPreset, setLightingPreset, isTouring, toggleTouring, setMovement } = useViewerStore();

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
    <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', background: '#0a0c10' }}>
      
      {/* 3D Canvas Background */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <ViewerCanvas />
      </div>

      {/* On-Screen Instructions for First-Person Mode */}
      <div style={{ 
        position: 'absolute', top: '120px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '12px 24px', borderRadius: '30px',
        color: 'white', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 5, pointerEvents: 'none',
        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        animation: 'fadeOutOld 10s ease-in forwards' // Auto-hide after 10 seconds
      }}>
        <MousePointer2 size={16} />
        <span style={{ fontSize: '14px', fontWeight: '500', letterSpacing: '0.5px' }}>
          Click screen to look around. Use <strong>W A S D</strong> to walk.
        </span>
      </div>

      <VirtualRemote />

      {/* Minimalist Floating UI overlaying the 3D Canvas */}
      <div style={{ position: 'absolute', bottom: '40px', left: '0', right: '0', pointerEvents: 'none', display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        
        <style>{`
          .interactive-controls { 
            display: flex; align-items: center; gap: 24px; padding: 12px 24px; 
            border-radius: 40px; pointer-events: auto;
            box-shadow: 0 24px 64px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(10, 12, 16, 0.8);
          }
          .lighting-label { font-size: 12px; font-weight: bold; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-right: 8px; letter-spacing: 1px; }
          .tour-btn { 
            padding: 12px 24px; border-radius: 30px; border: none; 
            cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold;
          }
          .divider { width: 1px; height: 32px; background: rgba(255,255,255,0.1); }
          
          @media (max-width: 768px) {
            .interactive-controls { gap: 16px; padding: 12px 16px; border-radius: 30px; width: 90%; justify-content: space-between; }
            .lighting-label { display: none; }
            .tour-btn { padding: 12px; border-radius: 50%; }
            .tour-btn-text { display: none; }
            .divider { display: none; }
          }
        `}</style>

        {/* Main Controls Container */}
        <div className="glass-panel interactive-controls">
          
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

    </div>
  );
}
