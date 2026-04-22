import React from 'react';
import { useViewerStore } from '../store/viewerStore';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw } from 'lucide-react';

export default function VirtualRemote() {
  const setMovement = useViewerStore(state => state.setMovement);

  const ArrowButton = ({ direction, icon: Icon, style }) => (
    <button
      className="glass-panel hover-lift"
      onPointerDown={(e) => { e.preventDefault(); setMovement(direction, true); }}
      onPointerUp={(e) => { e.preventDefault(); setMovement(direction, false); }}
      onPointerLeave={(e) => { e.preventDefault(); setMovement(direction, false); }}
      style={{
        width: '48px', height: '48px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white',
        cursor: 'pointer', borderRadius: '12px',
        ...style
      }}
    >
      <Icon size={24} />
    </button>
  );

  return (
    <>
      {/* Primary Movement D-Pad (Left Side Joystick) */}
      <div className="glass-panel" style={{
        position: 'absolute', bottom: '30px', left: '380px', zIndex: 100,
        padding: '16px', borderRadius: '24px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 48px)', gridTemplateRows: 'repeat(2, 48px)', gap: '8px'
      }}>
        {/* Top Row */}
        <div style={{ gridColumn: '2' }}>
          <ArrowButton direction="moveForward" icon={ArrowUp} />
        </div>
        
        {/* Bottom Row */}
        <div style={{ gridColumn: '1', gridRow: '2' }}>
          <ArrowButton direction="moveLeft" icon={ArrowLeft} />
        </div>
        <div style={{ gridColumn: '2', gridRow: '2' }}>
          <ArrowButton direction="moveBackward" icon={ArrowDown} />
        </div>
        <div style={{ gridColumn: '3', gridRow: '2' }}>
          <ArrowButton direction="moveRight" icon={ArrowRight} />
        </div>
      </div>

      {/* Secondary Camera Rotation Pad (Right Side Joystick) */}
      <div className="glass-panel" style={{
        position: 'absolute', bottom: '110px', right: '30px', zIndex: 100,
        padding: '12px 16px', borderRadius: '24px',
        display: 'flex', gap: '8px', alignItems: 'center'
      }}>
        <ArrowButton direction="lookLeft" icon={RotateCcw} style={{ width: '64px' }} />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Look</span>
        <ArrowButton direction="lookRight" icon={RotateCw} style={{ width: '64px' }} />
      </div>
    </>
  );
}
