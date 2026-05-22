import React, { useState } from 'react';
import { Share2, Link, Copy, CheckCircle2, X } from 'lucide-react';

export default function ShareModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const [copyBorderColor, setCopyBorderColor] = useState('rgba(255, 255, 255, 0.14)');
  
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
      } catch {
        console.log('User cancelled native share.');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(5, 6, 8, 0.65)', backdropFilter: 'blur(10px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="dark-obsidian-panel" style={{ 
        width: '400px', padding: '32px', borderRadius: '24px', position: 'relative',
        backgroundColor: 'rgba(10, 12, 18, 0.75)',
        backdropFilter: 'blur(30px) saturate(190%)',
        WebkitBackdropFilter: 'blur(30px) saturate(190%)',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
        border: '1px solid rgba(255, 255, 255, 0.14)'
      }}>
        
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', top: '16px', right: '16px', 
            background: 'transparent', border: 'none', color: '#ffffff', 
            cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.2s' 
          }} 
          onMouseEnter={e => e.currentTarget.style.opacity = 1} 
          onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.1)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', 
            color: '#ffffff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
            border: '1px solid rgba(255, 255, 255, 0.14)' 
          }}>
            <Share2 size={24} />
          </div>
          <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#ffffff', fontWeight: '800' }}>Share Gallery</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0, fontSize: '14px', fontWeight: '500' }}>Send this immersive property experience directly to your clients.</p>
        </div>

        <button 
          onClick={handleNativeShare}
          style={{ 
            width: '100%', padding: '16px', borderRadius: '12px', border: 'none', 
            background: '#ffffff', color: '#0a0c10', fontWeight: 'bold', 
            fontSize: '16px', cursor: 'pointer', marginBottom: '24px', 
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
        >
          {navigator.share ? 'Share via Device' : 'Copy Link'}
        </button>

        {/* Social Media Quick Share */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
          <a 
            href={`https://api.whatsapp.com/send?text=Explore%20this%20exclusive%20luxury%20property%20in%203D!%20${encodeURIComponent(shareUrl)}`} 
            target="_blank" 
            rel="noreferrer" 
            style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: 'rgba(255, 255, 255, 0.08)', color: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              textDecoration: 'none', border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.22)',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' 
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#25D366';
              e.currentTarget.style.borderColor = '#25D366';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 211, 102, 0.4)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.22)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </a>
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} 
            target="_blank" 
            rel="noreferrer"
            style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: 'rgba(255, 255, 255, 0.08)', color: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              textDecoration: 'none', border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.22)',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' 
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#1877F2';
              e.currentTarget.style.borderColor = '#1877F2';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(24, 119, 242, 0.4)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.22)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a 
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Explore%20this%20exclusive%20luxury%20property%20in%203D!`} 
            target="_blank" 
            rel="noreferrer"
            style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: 'rgba(255, 255, 255, 0.08)', color: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              textDecoration: 'none', border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.22)',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' 
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = '#000000';
              e.currentTarget.style.borderColor = '#ffffff';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.22)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
          </a>
          <a 
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} 
            target="_blank" 
            rel="noreferrer"
            style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: 'rgba(255, 255, 255, 0.08)', color: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              textDecoration: 'none', border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.22)',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' 
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#0A66C2';
              e.currentTarget.style.borderColor = '#0A66C2';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(10, 102, 194, 0.4)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.22)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"></path><circle cx="4" cy="4" r="2"></circle></svg>
          </a>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '12px 16px', 
          background: 'rgba(0, 0, 0, 0.35)', 
          borderRadius: '12px', 
          border: `1px solid ${copyBorderColor}`,
          transition: 'border-color 0.2s ease'
        }}
        onMouseEnter={() => setCopyBorderColor('rgba(255, 255, 255, 0.35)')}
        onMouseLeave={() => setCopyBorderColor('rgba(255, 255, 255, 0.14)')}
        >
          <Link size={16} style={{ color: '#ffffff', marginRight: '12px', opacity: 0.6 }} />
          <input 
            type="text" 
            readOnly 
            value={shareUrl} 
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#ffffff', fontSize: '14px', outline: 'none', fontWeight: '500' }} 
          />
          <button 
            onClick={handleCopy}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: copied ? '#10b981' : '#ffffff', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              padding: '8px',
              opacity: copied ? 1 : 0.6,
              transition: 'opacity 0.2s, color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => { if (!copied) e.currentTarget.style.opacity = 0.6; }}
          >
            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
          </button>
        </div>

      </div>
    </div>
  );
}
