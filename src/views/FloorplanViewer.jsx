import React from 'react';
import { useViewerStore } from '../store/viewerStore';

export default function FloorplanViewer() {
  const { customFloorplan, customFloorplans, activeFloorplanId, setActiveFloorplanId } = useViewerStore();

  const activePlan = customFloorplans?.find(f => f.id === activeFloorplanId);

  // Use the specific active plan URL if selected, otherwise fallback to the single uploaded customFloorplan
  const bgImage = activePlan ? activePlan.url : customFloorplan;

  return (
    <div style={{ padding: '120px 32px 32px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '300', margin: 0 }}>Level Floorplans</h2>
        
        {/* Segmented Controller */}
        {customFloorplans && customFloorplans.length > 0 && (
          <div className="glass-panel" style={{ display: 'flex', gap: '4px', padding: '6px', borderRadius: '40px' }}>
            {customFloorplans.map(plan => (
              <button
                key={plan.id}
                onClick={() => setActiveFloorplanId(plan.id)}
                style={{
                  padding: '8px 16px', borderRadius: '30px', border: 'none',
                  background: activeFloorplanId === plan.id ? 'var(--accent-color)' : 'transparent',
                  color: activeFloorplanId === plan.id ? 'white' : 'var(--text-secondary)',
                  fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease',
                  boxShadow: activeFloorplanId === plan.id ? '0 4px 12px var(--accent-glow)' : 'none'
                }}>
                {plan.level_name}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ flex: 1, position: 'relative', marginBottom: '32px' }}>
        {/* Render all plans absolutely with opacity transitions for smooth crossfading */}
        {customFloorplans && customFloorplans.map(plan => (
          <div 
            key={plan.id}
            className="glass-panel"
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: `url(${plan.image_url}) center/contain no-repeat rgba(255,255,255,0.02)`,
              borderRadius: '16px', overflow: 'hidden',
              opacity: activeFloorplanId === plan.id ? 1 : 0,
              pointerEvents: activeFloorplanId === plan.id ? 'auto' : 'none',
              transition: 'opacity 0.5s ease-in-out',
              zIndex: activeFloorplanId === plan.id ? 2 : 1
            }} 
          />
        ))}

        {(!customFloorplans || customFloorplans.length === 0) && (
          <div className="glass-panel" style={{ 
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: bgImage ? `url(${bgImage}) center/contain no-repeat rgba(255,255,255,0.02)` : 'rgba(255,255,255,0.02)',
            borderRadius: '16px', overflow: 'hidden'
          }}>
            {!bgImage && (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📐</div>
                <p>Interactive floorplan will render here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
