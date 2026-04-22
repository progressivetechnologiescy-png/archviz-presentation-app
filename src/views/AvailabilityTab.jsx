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
                      <td style={{ padding: '24px', fontFamily: 'monospace', fontSize: '16px', color: isSelected ? 'var(--accent-color)' : 'white' }}>{unit.price}</td>
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
                        <td colSpan="5" style={{ padding: '32px' }}>
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
                                   <button 
                                     onClick={() => setInquireStatus('form')}
                                     className="hover-lift"
                                     style={{ marginTop: '16px', background: 'var(--accent-color)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '30px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px var(--accent-glow)' }}>
                                     Inquire Unit #{unit.id}
                                   </button>
                                 </>
                               )}

                               {inquireStatus === 'form' && (
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                   <p style={{ margin: 0, fontWeight: 'bold' }}>Reserve Unit #{unit.id}</p>
                                   <input type="text" placeholder="Full Name" style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
                                   <input type="email" placeholder="Email Address" style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
                                   <input type="tel" placeholder="Phone Number" style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
                                   <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                     <button onClick={() => setInquireStatus('idle')} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}>Cancel</button>
                                     <button 
                                       onClick={() => {
                                         // Mock API Submission
                                         setInquireStatus('success');
                                         setTimeout(() => setInquireStatus('idle'), 4000);
                                       }} 
                                       className="hover-lift"
                                       style={{ flex: 2, padding: '12px', borderRadius: '8px', background: 'var(--accent-color)', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                       Submit Inquiry
                                     </button>
                                   </div>
                                 </div>
                               )}

                               {inquireStatus === 'success' && (
                                 <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Request Received</h4>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Our brokerage team will contact you shortly regarding Unit #{unit.id}.</p>
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
                    <td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No units found matching this filter.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
