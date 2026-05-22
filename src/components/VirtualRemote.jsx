import React from 'react';
import { useViewerStore } from '../store/viewerStore';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw, ChevronsUp, ChevronsDown } from 'lucide-react';

const ArrowButton = (props) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const IconToRender = props.icon;
  return (
    <button
      className="hover-lift"
      onPointerDown={(e) => { e.preventDefault(); props.setMovement(props.direction, true); }}
      onPointerUp={(e) => { e.preventDefault(); props.setMovement(props.direction, false); }}
      onPointerLeave={(e) => { e.preventDefault(); props.setMovement(props.direction, false); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '48px', height: '48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        background: isHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
        color: '#ffffff',
        cursor: 'pointer', borderRadius: '12px',
        boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.22)' : 'none',
        transition: 'all 0.2s ease',
        ...props.style
      }}
    >
      <IconToRender size={24} />
    </button>
  );
};

const kbdStyle = {
  background: 'rgba(255, 255, 255, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '6px',
  padding: '2px 6px',
  fontSize: '11px',
  fontFamily: 'Outfit, sans-serif',
  fontWeight: '800',
  color: '#ffffff',
  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.25)',
  minWidth: '16px',
  textAlign: 'center',
  display: 'inline-block',
  lineHeight: '1',
  margin: '0 2px'
};

export default function VirtualRemote() {
  const setMovement = useViewerStore(state => state.setMovement);
  const controlMode = useViewerStore(state => state.controlMode);
  
  const [isTouchDevice] = React.useState(() => typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)));

  // Only render walking virtual pads when actively in Walk Explorer mode
  if (controlMode !== 'walk') return null;

  if (!isTouchDevice) {
    return (
      <>
        <style>{`
          @keyframes walkGuideEntrance {
            from { opacity: 0; transform: translate3d(-50%, 16px, 0); }
            to { opacity: 1; transform: translate3d(-50%, 0, 0); }
          }
        `}</style>
        <div style={{
          position: 'absolute',
          bottom: '110px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          pointerEvents: 'none',
          animation: 'walkGuideEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <div className="dark-obsidian-panel" style={{
            padding: '8px 16px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(16, 18, 26, 0.45)',
            backdropFilter: 'blur(30px) saturate(210%)',
            WebkitBackdropFilter: 'blur(30px) saturate(210%)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
            color: '#ffffff',
            fontFamily: 'Outfit, sans-serif',
            whiteSpace: 'nowrap'
          }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#ffffff', letterSpacing: '1px', textTransform: 'uppercase' }}>Walk Mode</span>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.15)' }}>•</span>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              <kbd style={kbdStyle}>W</kbd>
              <kbd style={kbdStyle}>A</kbd>
              <kbd style={kbdStyle}>S</kbd>
              <kbd style={kbdStyle}>D</kbd>
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>to Walk</span>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.15)' }}>•</span>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
              <kbd style={kbdStyle}>Shift</kbd>
              <kbd style={kbdStyle}>Ctrl</kbd>
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>to Fly</span>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.15)' }}>•</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#ffffff' }}>Drag Mouse to Look</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .virtual-joystick-left {
          position: absolute; bottom: 30px; left: 32px; z-index: 100;
          padding: 16px; border-radius: 24px;
          display: grid; grid-template-columns: repeat(4, 48px); grid-template-rows: auto repeat(2, 48px); gap: 8px;
          background: rgba(16, 18, 26, 0.45) !important;
          border: 1px solid rgba(255, 255, 255, 0.14) !important;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.22) !important;
          backdrop-filter: blur(30px) saturate(210%);
          -webkit-backdrop-filter: blur(30px) saturate(210%);
        }
        .virtual-joystick-right {
          position: absolute; bottom: 30px; right: 32px; z-index: 100;
          padding: 12px 16px; border-radius: 24px;
          display: flex; gap: 8px; align-items: center;
          background: rgba(16, 18, 26, 0.45) !important;
          border: 1px solid rgba(255, 255, 255, 0.14) !important;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.22) !important;
          backdrop-filter: blur(30px) saturate(210%);
          -webkit-backdrop-filter: blur(30px) saturate(210%);
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
      <div className="dark-obsidian-panel virtual-joystick-left">
        {/* Row 1: Keyboard WASD Helper (spans all columns, hidden on mobile) */}
        <div className="keyboard-helper-row" style={{ gridColumn: '1 / span 4', gridRow: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: '8px', marginBottom: '2px', userSelect: 'none' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '700', letterSpacing: '0.5px' }}>KEYBOARD:</span>
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
      <div className="dark-obsidian-panel virtual-joystick-right">
        <ArrowButton direction="lookLeft" icon={RotateCcw} style={{ width: '64px' }} setMovement={setMovement} />
        <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Look</span>
        <ArrowButton direction="lookRight" icon={RotateCw} style={{ width: '64px' }} setMovement={setMovement} />
      </div>
    </>
  );
}
