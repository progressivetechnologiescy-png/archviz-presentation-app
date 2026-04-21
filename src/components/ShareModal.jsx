import React, { useState } from 'react';
import { Share2, Link, Copy, CheckCircle2, X } from 'lucide-react';

export default function ShareModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  
  // Safely strip the admin parameter so clients don't get backend access
  const safeLocation = new URL(window.location.href);
  safeLocation.searchParams.delete('admin');
  const shareUrl = safeLocation.toString();

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'The Pinnacle Residence - 3D Interactive Showcase',
          text: 'Explore this exclusive luxury property in full 3D interactive VR.',
          url: shareUrl,
        });
        onClose();
      } catch (err) {
        console.log('User cancelled native share.');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" style={{ width: '400px', padding: '32px', borderRadius: '24px', position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--accent-color)' }}>
            <Share2 size={24} />
          </div>
          <h2 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Share Gallery</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Send this immersive property experience directly to your clients.</p>
        </div>

        <button 
          onClick={handleNativeShare}
          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: 'var(--accent-color)', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '16px', boxShadow: '0 8px 24px var(--accent-glow)' }}
        >
          {navigator.share ? 'Share via Device' : 'Copy Link'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <Link size={16} style={{ color: 'var(--text-secondary)', marginRight: '12px' }} />
          <input 
            type="text" 
            readOnly 
            value={shareUrl} 
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', outline: 'none' }} 
          />
          <button 
            onClick={handleCopy}
            style={{ background: 'transparent', border: 'none', color: copied ? '#4ade80' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px' }}
          >
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
          </button>
        </div>

      </div>
    </div>
  );
}
