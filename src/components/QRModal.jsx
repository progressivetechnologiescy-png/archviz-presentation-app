import React from 'react';
import { X, Smartphone } from 'lucide-react';

export default function QRModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div 
        className="dark-obsidian-panel hover-lift" 
        style={{ 
          width: '400px', 
          padding: '40px', 
          borderRadius: '24px', 
          position: 'relative', 
          textAlign: 'center',
          background: 'rgba(10, 12, 18, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
          backdropFilter: 'blur(30px) saturate(210%)',
          WebkitBackdropFilter: 'blur(30px) saturate(210%)',
          color: '#ffffff'
        }}
      >
        
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', 
            top: '16px', 
            right: '16px', 
            background: 'transparent', 
            border: 'none', 
            color: 'rgba(255, 255, 255, 0.6)', 
            cursor: 'pointer',
            transition: 'color 0.2s' 
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
        >
          <X size={24} />
        </button>

        <div style={{ 
          width: '64px', height: '64px', borderRadius: '50%', 
          background: 'rgba(255, 255, 255, 0.1)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', 
          color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255, 255, 255, 0.22)' 
        }}>
          <Smartphone size={32} />
        </div>

        <h2 style={{ fontSize: '24px', margin: '0 0 12px 0', color: '#ffffff' }}>View on your desk</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 32px 0', fontSize: '15px', lineHeight: '1.5' }}>
          Scan this QR Code with your iPhone or Android camera to drop the 3D property model into your physical room using WebAR.
        </p>

        {/* Dynamic QR Code Generation */}
        <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '24px' }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + window.location.pathname + '?mode=ar')}`}
            alt="AR QR Code"
            style={{ width: '200px', height: '200px' }}
          />
        </div>

        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Powered by WebXR
        </p>

      </div>
    </div>
  );
}
