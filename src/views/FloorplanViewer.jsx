import React from 'react';
import { useViewerStore } from '../store/viewerStore';

export default function FloorplanViewer() {
  const { customFloorplans, activeFloorplanId, setActiveFloorplanId } = useViewerStore();

  const activePlan = customFloorplans?.find(f => f.id === activeFloorplanId);

  // Extract unique property types sorted by custom order
  const propertyTypes = React.useMemo(() => {
    if (!customFloorplans || customFloorplans.length === 0) return [];
    
    const orderMap = {};
    customFloorplans.forEach(f => {
      if (f.property_type) {
        orderMap[f.property_type] = Number(f.property_type_order) || 0;
      }
    });
    
    const uniqueBlocks = [...new Set(customFloorplans.map(f => f.property_type || 'Default Property'))];
    return uniqueBlocks.sort((a, b) => (orderMap[a] || 0) - (orderMap[b] || 0));
  }, [customFloorplans]);

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
      className="floorplan-master-container"
      onScroll={(e) => useViewerStore.getState().setGlobalScrolled(e.target.scrollTop > 50)}
    >
      <style>{`
        .floorplan-master-container {
          padding: 120px 32px 32px;
          display: flex;
          gap: 32px;
          height: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }
        .floorplan-sidebar {
          width: 320px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100%;
          overflow-y: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .floorplan-sidebar::-webkit-scrollbar {
          display: none;
        }
        .floorplan-main {
          flex: 1;
          min-width: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .list-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        @media (max-width: 1024px) {
          .floorplan-master-container {
            padding: 100px 16px 32px !important;
            flex-direction: column;
            gap: 16px;
            overflow-y: auto; 
          }
          .floorplan-sidebar {
            width: 100%;
            height: auto;
            flex-shrink: 0;
            gap: 16px;
            overflow: visible;
          }
          .glass-panel-responsive {
             padding: 16px !important;
             border-radius: 20px !important;
          }
          .list-container {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 8px;
            -webkit-overflow-scrolling: touch;
          }
          .list-container button {
            white-space: nowrap;
          }
          .floorplan-main {
            min-height: 60vh;
            height: auto;
            flex: 1;
          }
        }
      `}</style>
      
      {customFloorplans && customFloorplans.length > 0 ? (
        <>
          {/* Left Sidebar: Controls */}
          <div className="floorplan-sidebar">
            
            {/* Property Selector */}
            {propertyTypes.length > 1 && (
              <div className="glass-panel glass-panel-responsive" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 'bold' }}>Property Type</h3>
                <div className="list-container">
                  {propertyTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setActivePropertyType(type)}
                      className="hover-lift"
                      style={{
                        padding: '12px 20px', borderRadius: '12px', border: 'none', textAlign: 'left',
                        background: activePropertyType === type ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                        color: activePropertyType === type ? 'white' : 'var(--text-primary)',
                        fontWeight: activePropertyType === type ? 'bold' : '600', cursor: 'pointer', transition: 'all 0.3s ease',
                        fontSize: '15px',
                        boxShadow: activePropertyType === type ? '0 4px 16px var(--accent-glow)' : 'none',
                      }}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Level Selector */}
            {filteredFloorplans && filteredFloorplans.length > 0 && (
              <div className="glass-panel glass-panel-responsive" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 'bold' }}>Floor Levels</h3>
                <div className="list-container">
                  {filteredFloorplans.map(plan => (
                    <button
                      key={plan.id}
                      onClick={() => setActiveFloorplanId(plan.id)}
                      style={{
                        padding: '12px 20px', borderRadius: '12px', border: activeFloorplanId === plan.id ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', textAlign: 'left',
                        background: activeFloorplanId === plan.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: activeFloorplanId === plan.id ? 'white' : 'var(--text-secondary)',
                        fontWeight: activeFloorplanId === plan.id ? 'bold' : '500', cursor: 'pointer', transition: 'all 0.3s ease',
                        fontSize: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                      {plan.level_name}
                      {activeFloorplanId === plan.id && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 8px var(--accent-color)' }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Viewport: Floorplan Image */}
          <div className="floorplan-main">
            <div 
              className="glass-panel"
              style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {customFloorplans.map(plan => (
                <div 
                  key={plan.id}
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    opacity: activeFloorplanId === plan.id ? 1 : 0,
                    pointerEvents: activeFloorplanId === plan.id ? 'auto' : 'none',
                    transition: 'opacity 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    transform: activeFloorplanId === plan.id ? 'scale(1)' : 'scale(0.98)',
                    zIndex: activeFloorplanId === plan.id ? 2 : 1
                  }} 
                >
                  {/* Image Layer */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: `url(${plan.image_url}) center/contain no-repeat`,
                    backgroundColor: 'rgba(5, 8, 12, 0.6)'
                  }} />
                  
                  {/* Premium Vignette Overlay */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'radial-gradient(circle at center, transparent 40%, rgba(5,8,12,0.95) 150%)',
                    pointerEvents: 'none', zIndex: 2
                  }} />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="glass-panel" style={{ 
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '24px', overflow: 'hidden', minHeight: '400px', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📐</div>
            <p>No floorplans have been uploaded yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
