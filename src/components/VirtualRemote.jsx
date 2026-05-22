import React from 'react';
import { useViewerStore } from '../store/viewerStore';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw, ChevronsUp, ChevronsDown } from 'lucide-react';

const ArrowButton = (props) => {
  const IconToRender = props.icon;
  return (
    <button
      className="glass-panel hover-lift"
      onPointerDown={(e) => { e.preventDefault(); props.setMovement(props.direction, true); }}
      onPointerUp={(e) => { e.preventDefault(); props.setMovement(props.direction, false); }}
      onPointerLeave={(e) => { e.preventDefault(); props.setMovement(props.direction, false); }}
      style={{
        width: '48px', height: '48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)',
        cursor: 'pointer', borderRadius: '12px',
        ...props.style
      }}
    >
      <IconToRender size={24} />
    </button>
  );
};

const kbdStyle = {
  background: 'rgba(255, 255, 255, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '6px',
  padding: '1px 5px',
  fontSize: '10px',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: '800',
  color: 'white',
  boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
  minWidth: '16px',
  textAlign: 'center',
  display: 'inline-block',
  lineHeight: '1'
};

export default function VirtualRemote() {
  const setMovement = useViewerStore(state => state.setMovement);
  const controlMode = useViewerStore(state => state.controlMode);
  
  const [isTouchDevice] = React.useState(() => typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)));

  // Only render walking virtual pads when actively in Walk Explorer mode
  if (controlMode !== 'walk') return null;

  if (!isTouchDevice) {
    return (
      <div className="glass-panel" style={{
        position: 'absolute',
        bottom: '120px',
        left: '32px',
        zIndex: 100,
        padding: '10px 18px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(10, 12, 16, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        color: 'white',
        fontFamily: 'Outfit, sans-serif',
        pointerEvents: 'none',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
      }}>
        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-color, #3b82f6)', letterSpacing: '1px', textTransform: 'uppercase' }}>Walk Mode</span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>•</span>
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          <kbd style={kbdStyle}>W</kbd>
          <kbd style={kbdStyle}>A</kbd>
          <kbd style={kbdStyle}>S</kbd>
          <kbd style={kbdStyle}>D</kbd>
        </div>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>to Walk</span>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>•</span>
        <span style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255,255,255,0.8)' }}>Drag Mouse to Look</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .virtual-joystick-left {
          position: absolute; bottom: 30px; left: 32px; z-index: 100;
          padding: 16px; border-radius: 24px;
          display: grid; grid-template-columns: repeat(4, 48px); grid-template-rows: auto repeat(2, 48px); gap: 8px;
        }
        .virtual-joystick-right {
          position: absolute; bottom: 30px; right: 32px; z-index: 100;
          padding: 12px 16px; border-radius: 24px;
          display: flex; gap: 8px; align-items: center;
        }
        
        @media (max-width: 1024px) {
          .virtual-joystick-left { left: 24px; bottom: 40px; }
          .virtual-joystick-right { right: 24px; bottom: 40px; }
        }
        
        @media (max-width: 600px) {
          .keyboard-helper-row {
            display: none !important;
          }
          .virtual-joystick-left {
            left: 16px; bottom: 20px; padding: 12px; gap: 4px;
            grid-template-columns: repeat(4, 40px); grid-template-rows: repeat(2, 40px) !important;
          }
          .virtual-joystick-right {
            right: 16px; bottom: 20px; padding: 8px 12px; gap: 4px;
          }
        }
      `}</style>
      
      {/* Primary Movement D-Pad (Left Side Joystick) */}
      <div className="glass-panel virtual-joystick-left">
        {/* Row 1: Keyboard WASD Helper (spans all columns, hidden on mobile) */}
        <div className="keyboard-helper-row" style={{ gridColumn: '1 / span 4', gridRow: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', marginBottom: '2px', userSelect: 'none' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: '0.5px' }}>KEYBOARD:</span>
          <kbd style={kbdStyle}>W</kbd>
          <kbd style={kbdStyle}>A</kbd>
          <kbd style={kbdStyle}>S</kbd>
          <kbd style={kbdStyle}>D</kbd>
        </div>

        {/* Left Column (Vertical Fly controls) */}
        <div style={{ gridColumn: '1', gridRow: '2', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          <ArrowButton direction="moveUp" icon={ChevronsUp} style={{ width: '40px', height: '40px' }} setMovement={setMovement} />
        </div>
        <div style={{ gridColumn: '1', gridRow: '3', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <ArrowButton direction="moveDown" icon={ChevronsDown} style={{ width: '40px', height: '40px' }} setMovement={setMovement} />
        </div>

        {/* Right Columns (Planar WASD equivalent) */}
        <div style={{ gridColumn: '3', gridRow: '2' }}>
          <ArrowButton direction="moveForward" icon={ArrowUp} style={{ width: '100%', height: '100%' }} setMovement={setMovement} />
        </div>
        <div style={{ gridColumn: '2', gridRow: '3' }}>
          <ArrowButton direction="moveLeft" icon={ArrowLeft} style={{ width: '100%', height: '100%' }} setMovement={setMovement} />
        </div>
        <div style={{ gridColumn: '3', gridRow: '3' }}>
          <ArrowButton direction="moveBackward" icon={ArrowDown} style={{ width: '100%', height: '100%' }} setMovement={setMovement} />
        </div>
        <div style={{ gridColumn: '4', gridRow: '3' }}>
          <ArrowButton direction="moveRight" icon={ArrowRight} style={{ width: '100%', height: '100%' }} setMovement={setMovement} />
        </div>
      </div>

      {/* Secondary Camera Rotation Pad (Right Side Joystick) */}
      <div className="glass-panel virtual-joystick-right">
        <ArrowButton direction="lookLeft" icon={RotateCcw} style={{ width: '64px' }} setMovement={setMovement} />
        <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Look</span>
        <ArrowButton direction="lookRight" icon={RotateCw} style={{ width: '64px' }} setMovement={setMovement} />
      </div>
    </>
  );
}
