import React, { useState } from 'react';
import { useViewerStore } from '../store/viewerStore';

const DUMMY_UNITS = [
  { id: '101', type: '2 Bed, 2 Bath', sqft: 1450, price: '$1,250,000', status: 'Sold' },
  { id: '102', type: '3 Bed, 3 Bath', sqft: 2100, price: '$1,850,000', status: 'Available' },
  { id: '201', type: '2 Bed, 2 Bath', sqft: 1500, price: '$1,350,000', status: 'Available' },
  { id: '202', type: '3 Bed, 3.5 Bath', sqft: 2200, price: '$2,100,000', status: 'Reserved' },
  { id: '301', type: 'Penthouse', sqft: 3500, price: '$4,500,000', status: 'Available' },
];

export default function AvailabilityTab() {
  const [filter, setFilter] = useState('All');
  const [activeUnitId, setActiveUnitId] = useState(null);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [inquireStatus, setInquireStatus] = useState('idle'); // idle, form, success
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const { customFloorplans } = useViewerStore();

  const filteredUnits = DUMMY_UNITS.filter(unit => filter === 'All' || unit.status === filter);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'rgba(34, 197, 94, 0.2)'; // Green
      case 'Reserved': return 'rgba(234, 179, 8, 0.2)'; // Yellow
      case 'Sold': return 'rgba(239, 68, 68, 0.2)'; // Red
      default: return 'transparent';
    }
  };

  const getStatusTextColor = (status) => {
    switch(status) {
      case 'Available': return '#4ade80';
      case 'Reserved': return '#facc15';
      case 'Sold': return '#f87171';
      default: return 'white';
    }
  };

  const handlePreviewFloorplan = (e, unit) => {
    e.stopPropagation();
    if (customFloorplans && customFloorplans.length > 0) {
      const match = customFloorplans.find(f => 
        (f.level_name && unit.type && f.level_name.toLowerCase().includes(unit.type.toLowerCase().split(',')[0])) || 
        (f.level_name && f.level_name.includes(unit.id))
      );
      if (match) setPreviewImageUrl(match.image_url);
      else setPreviewImageUrl(customFloorplans[0].image_url);
    }
  };

  return (
    <div 
      style={{ padding: '120px 32px 32px', height: '100%', overflowY: 'auto' }}
      onScroll={(e) => useViewerStore.getState().setGlobalScrolled(e.target.scrollTop > 50)}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '300', margin: '0 0 8px 0' }}>Current Availability</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>View pricing and lock in your reservation.</p>
          </div>

          <div className="glass-panel" style={{ display: 'flex', gap: '4px', padding: '6px', borderRadius: '40px' }}>
            {['All', 'Available', 'Reserved', 'Sold'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '8px 16px', borderRadius: '30px', border: 'none',
                  background: filter === status ? 'var(--text-primary)' : 'transparent',
                  color: filter === status ? 'var(--bg-dark)' : 'var(--text-secondary)',
                  fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease'
                }}>
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '24px', fontWeight: '600', color: 'var(--text-secondary)' }}>Unit</th>
                <th style={{ padding: '24px', fontWeight: '600', color: 'var(--text-secondary)' }}>Layout</th>
                <th style={{ padding: '24px', fontWeight: '600', color: 'var(--text-secondary)' }}>Sq. Ft.</th>
                <th style={{ padding: '24px', fontWeight: '600', color: 'var(--text-secondary)' }}>Price</th>
                <th style={{ padding: '24px', fontWeight: '600', color: 'var(--text-secondary)', textAlign: 'center' }}>Plan</th>
                <th style={{ padding: '24px', fontWeight: '600', color: 'var(--text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.length > 0 ? filteredUnits.map((unit, index) => {
                const numericPrice = parseInt(unit.price.replace(/[^0-9]/g, ''));
                const isSelected = activeUnitId === unit.id;
                
                return (
                  <React.Fragment key={unit.id}>
                    <tr onClick={() => {
                        setActiveUnitId(isSelected ? null : unit.id);
                        setInquireStatus('idle');
                      }} 
                      className="hover-lift" style={{ 
                      borderBottom: (index === filteredUnits.length - 1 && !isSelected) ? 'none' : '1px solid rgba(255,255,255,0.05)',
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                    }}>
                      <td style={{ padding: '24px', fontWeight: 'bold' }}>#{unit.id}</td>
                      <td style={{ padding: '24px', color: 'var(--text-secondary)' }}>{unit.type}</td>
                      <td style={{ padding: '24px' }}>{unit.sqft}</td>
                      <td style={{ padding: '24px', fontSize: '16px', color: isSelected ? 'var(--accent-color)' : 'white', fontWeight: '500' }}>{unit.price}</td>
                      <td style={{ padding: '24px', textAlign: 'center' }}>
                        {customFloorplans && customFloorplans.length > 0 && (
                          <button 
                            onClick={(e) => handlePreviewFloorplan(e, unit)}
                            className="hover-lift"
                            style={{ 
                              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', 
                              borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="3" y1="9" x2="21" y2="9"></line>
                              <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '24px' }}>
                        <span style={{ 
                          padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px',
                          background: getStatusColor(unit.status), color: getStatusTextColor(unit.status), border: `1px solid ${getStatusTextColor(unit.status)}40`
                        }}>
                          {unit.status}
                        </span>
                      </td>
                    </tr>
                    
                    {/* Live Financing Calculator Panel for Active Unit */}
                    {isSelected && (
                      <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td colSpan="6" style={{ padding: '32px' }}>
                          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                            <div style={{ flex: 1, paddingRight: '32px', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Financing Estimator
                              </h3>
                              
                              <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                  <span>Down Payment ({downPaymentPct}%)</span>
                                  <span>${(numericPrice * (downPaymentPct / 100)).toLocaleString()}</span>
                                </div>
                                <input type="range" min="10" max="100" step="5" value={downPaymentPct} onChange={(e) => setDownPaymentPct(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-color)' }} />
                              </div>

                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                  <span>Interest Rate ({interestRate}%)</span>
                                </div>
                                <input type="range" min="2.0" max="8.0" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-color)' }} />
                              </div>
                            </div>
                            
                            <div style={{ flex: 1 }}>
                               {inquireStatus === 'idle' && (
                                 <>
                                   <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px 0', fontSize: '14px' }}>Estimated Monthly Payment (30yr Fixed)</p>
                                   <div style={{ fontSize: '48px', fontWeight: '300', color: 'var(--accent-color)' }}>
                                     ${(() => {
                                        const principal = numericPrice - (numericPrice * (downPaymentPct / 100));
                                        if (principal === 0) return '0';
                                        const r = (interestRate / 100) / 12;
                                        const n = 360;
                                        const payment = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                                        return payment.toLocaleString('en-US', { maximumFractionDigits: 0 });
                                     })()}
                                     <span style={{ fontSize: '16px', color: 'var(--text-secondary)', marginLeft: '8px' }}>/ mo</span>
                                   </div>
                                   <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                     <button 
                                       onClick={() => setInquireStatus('form')}
                                       className="hover-lift"
                                       style={{ flex: 1, background: 'var(--accent-color)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '30px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px var(--accent-glow)' }}>
                                       Inquire Unit #{unit.id}
                                     </button>
                                   </div>
                                 </>
                               )}

                               {inquireStatus === 'form' && (
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                   <input type="text" placeholder="Full Name" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                                   <input type="email" placeholder="Email Address" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                                   <div style={{ display: 'flex', gap: '8px' }}>
                                     <button onClick={() => setInquireStatus('idle')} style={{ flex: 1, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                     <button onClick={() => setInquireStatus('success')} className="hover-lift" style={{ flex: 1, background: 'var(--accent-color)', color: 'white', border: 'none', padding: '12px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>Submit</button>
                                   </div>
                                 </div>
                               )}

                               {inquireStatus === 'success' && (
                                 <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                                   <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                                   <h4 style={{ color: '#4ade80', margin: '0 0 8px 0' }}>Inquiry Sent</h4>
                                   <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Our sales team will contact you shortly about Unit #{unit.id}.</p>
                                 </div>
                               )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }) : (
                <tr>
                  <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No availability found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floorplan Lightbox Modal */}
      {previewImageUrl && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(10px)'
        }} onClick={() => setPreviewImageUrl(null)}>
          
          <button 
            onClick={() => setPreviewImageUrl(null)}
            style={{
              position: 'absolute', top: '32px', right: '32px',
              background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
              width: '48px', height: '48px', borderRadius: '50%',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            ×
          </button>
          
          <div style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img src={previewImageUrl} alt="Floorplan Preview" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
          </div>
        </div>
      )}
    </div>
  );
}
