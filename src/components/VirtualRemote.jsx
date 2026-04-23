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
        border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white',
        cursor: 'pointer', borderRadius: '12px',
        ...props.style
      }}
    >
      <IconToRender size={24} />
    </button>
  );
};

export default function VirtualRemote() {
  const setMovement = useViewerStore(state => state.setMovement);

  return (
    <>
      <style>{`
        .virtual-joystick-left {
          position: absolute; bottom: 30px; left: 380px; z-index: 100;
          padding: 16px; border-radius: 24px;
          display: grid; grid-template-columns: repeat(4, 48px); grid-template-rows: repeat(2, 48px); gap: 8px;
        }
        .virtual-joystick-right {
          position: absolute; bottom: 30px; right: 380px; z-index: 100;
          padding: 12px 16px; border-radius: 24px;
          display: flex; gap: 8px; align-items: center;
        }
        
        @media (max-width: 1024px) {
          .virtual-joystick-left { left: 24px; bottom: 40px; }
          .virtual-joystick-right { right: 24px; bottom: 40px; }
        }
        
        @media (max-width: 600px) {
          .virtual-joystick-left {
            left: 16px; bottom: 20px; padding: 12px; gap: 4px;
            grid-template-columns: repeat(4, 40px); grid-template-rows: repeat(2, 40px);
          }
          .virtual-joystick-right {
            right: 16px; bottom: 20px; padding: 8px 12px; gap: 4px;
          }
        }
      `}</style>
      
      {/* Primary Movement D-Pad (Left Side Joystick) */}
      <div className="glass-panel virtual-joystick-left">
        {/* Left Column (Vertical Fly controls) */}
        <div style={{ gridColumn: '1', gridRow: '1', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
          <ArrowButton direction="moveUp" icon={ChevronsUp} style={{ width: '40px', height: '40px' }} setMovement={setMovement} />
        </div>
        <div style={{ gridColumn: '1', gridRow: '2', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
          <ArrowButton direction="moveDown" icon={ChevronsDown} style={{ width: '40px', height: '40px' }} setMovement={setMovement} />
        </div>

        {/* Right Columns (Planar WASD equivalent) */}
        <div style={{ gridColumn: '3', gridRow: '1' }}>
          <ArrowButton direction="moveForward" icon={ArrowUp} style={{ width: '100%', height: '100%' }} setMovement={setMovement} />
        </div>
        <div style={{ gridColumn: '2', gridRow: '2' }}>
          <ArrowButton direction="moveLeft" icon={ArrowLeft} style={{ width: '100%', height: '100%' }} setMovement={setMovement} />
        </div>
        <div style={{ gridColumn: '3', gridRow: '2' }}>
          <ArrowButton direction="moveBackward" icon={ArrowDown} style={{ width: '100%', height: '100%' }} setMovement={setMovement} />
        </div>
        <div style={{ gridColumn: '4', gridRow: '2' }}>
          <ArrowButton direction="moveRight" icon={ArrowRight} style={{ width: '100%', height: '100%' }} setMovement={setMovement} />
        </div>
      </div>

      {/* Secondary Camera Rotation Pad (Right Side Joystick) */}
      <div className="glass-panel virtual-joystick-right">
        <ArrowButton direction="lookLeft" icon={RotateCcw} style={{ width: '64px' }} setMovement={setMovement} />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Look</span>
        <ArrowButton direction="lookRight" icon={RotateCw} style={{ width: '64px' }} setMovement={setMovement} />
      </div>
    </>
  );
}
