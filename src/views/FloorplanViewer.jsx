import React from 'react';
import { useViewerStore } from '../store/viewerStore';

export default function FloorplanViewer() {
  const { customFloorplans, activeFloorplanId, setActiveFloorplanId } = useViewerStore();

  const activePlan = customFloorplans?.find(f => f.id === activeFloorplanId);

  // Extract unique property types
  const propertyTypes = customFloorplans && customFloorplans.length > 0
    ? [...new Set(customFloorplans.map(f => f.property_type || 'Default Property'))]
    : [];

  const [activePropertyType, setActivePropertyType] = React.useState(
    activePlan ? (activePlan.property_type || 'Default Property') : (propertyTypes[0] || 'Default Property')
  );

  // Filter floorplans by the selected property type, and sort them by order_index
  const filteredFloorplans = customFloorplans
    ? customFloorplans
        .filter(f => (f.property_type || 'Default Property') === activePropertyType)
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    : [];

  // When changing property type, automatically select its first floorplan
  React.useEffect(() => {
    if (filteredFloorplans.length > 0 && !filteredFloorplans.find(f => f.id === activeFloorplanId)) {
      setActiveFloorplanId(filteredFloorplans[0].id);
    }
  }, [activePropertyType, filteredFloorplans, activeFloorplanId, setActiveFloorplanId]);

  return (
    <div 
      style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
      className="floorplan-container"
      onScroll={(e) => useViewerStore.getState().setGlobalScrolled(e.target.scrollTop > 50)}
    >
      <style>{`
        .floorplan-container { padding: 120px 32px 32px !important; }
        .property-selector { display: flex; gap: 8px; margin-bottom: 24px; }
        .floorplan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-shrink: 0; }
        .level-controller { display: flex; gap: 4px; padding: 6px; border-radius: 40px; }
        
        @media (max-width: 768px) {
          .floorplan-container { padding: 100px 16px 32px !important; }
          .property-selector { overflow-x: auto; max-width: 100vw; white-space: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 8px; }
          .floorplan-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .level-controller { overflow-x: auto; max-width: 100vw; white-space: nowrap; -webkit-overflow-scrolling: touch; width: 100%; }
        }
      `}</style>
      
      {/* Top-Level Property Type Menu */}
      {(propertyTypes.length > 1 || (propertyTypes.length === 1 && propertyTypes[0] !== 'Default Property')) && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', flexShrink: 0 }}>
          <div className="glass-panel property-selector" style={{ padding: '6px', borderRadius: '40px', background: 'rgba(0,0,0,0.4)' }}>
            {propertyTypes.map(type => (
              <button
                key={type}
                onClick={() => setActivePropertyType(type)}
                style={{
                  padding: '8px 24px', borderRadius: '30px', border: 'none',
                  background: activePropertyType === type ? 'var(--text-primary)' : 'transparent',
                  color: activePropertyType === type ? 'var(--bg-main)' : 'var(--text-secondary)',
                  fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease',
                  fontSize: '15px'
                }}>
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {customFloorplans && customFloorplans.length > 0 && (
        <div className="floorplan-header">
          <h2 style={{ fontSize: '28px', fontWeight: '300', margin: 0 }}>
            {propertyTypes.length > 1 ? activePropertyType : 'Level Floorplans'}
          </h2>
          
          {/* Secondary Level Controller */}
          {filteredFloorplans && filteredFloorplans.length > 0 && (
            <div className="glass-panel level-controller">
              {filteredFloorplans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setActiveFloorplanId(plan.id)}
                  style={{
                    padding: '8px 16px', borderRadius: '30px', border: 'none',
                    background: activeFloorplanId === plan.id ? 'var(--accent-color)' : 'transparent',
                    color: activeFloorplanId === plan.id ? 'white' : 'var(--text-secondary)',
                    fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease',
                    boxShadow: activeFloorplanId === plan.id ? '0 4px 12px var(--accent-glow)' : 'none',
                    whiteSpace: 'nowrap'
                  }}>
                  {plan.level_name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Floorplan Rendering Area */}
      <div style={{ flex: 1, position: 'relative', marginBottom: '32px', minHeight: '400px' }}>
        {customFloorplans && customFloorplans.length > 0 ? (
          customFloorplans.map(plan => (
            <div 
              key={plan.id}
              className="glass-panel"
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                borderRadius: '16px', overflow: 'hidden',
                opacity: activeFloorplanId === plan.id ? 1 : 0,
                pointerEvents: activeFloorplanId === plan.id ? 'auto' : 'none',
                transition: 'opacity 0.5s ease-in-out',
                zIndex: activeFloorplanId === plan.id ? 2 : 1
              }} 
            >
              {/* Image Layer */}
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: `url(${plan.image_url}) center/contain no-repeat rgba(10,12,16,0.5)`,
                zIndex: 1
              }} />
              
              {/* Horizontal Fade Overlay (Left and Right edges only) */}
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(to right, rgba(10,12,16,1) 0%, rgba(10,12,16,0) 15%, rgba(10,12,16,0) 85%, rgba(10,12,16,1) 100%)',
                pointerEvents: 'none',
                zIndex: 2
              }} />
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ 
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px', overflow: 'hidden', minHeight: '400px'
          }}>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📐</div>
              <p>No floorplans have been uploaded yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
