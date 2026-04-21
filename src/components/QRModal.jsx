import React from 'react';
import { X, Smartphone } from 'lucide-react';

export default function QRModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel hover-lift" style={{ width: '400px', padding: '40px', borderRadius: '24px', position: 'relative', textAlign: 'center' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--accent-color)' }}>
          <Smartphone size={32} />
        </div>

        <h2 style={{ fontSize: '24px', margin: '0 0 12px 0' }}>View on your desk</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px 0', fontSize: '15px', lineHeight: '1.5' }}>
          Scan this QR Code with your iPhone or Android camera to drop the 3D property model into your physical room using WebAR.
        </p>

        {/* Dynamic QR Code Generation */}
        <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '24px' }}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`}
            alt="AR QR Code"
            style={{ width: '200px', height: '200px' }}
          />
        </div>

        <p style={{ margin: 0, fontSize: '13px', color: 'var(--accent-color)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Powered by WebXR
        </p>

      </div>
    </div>
  );
}
