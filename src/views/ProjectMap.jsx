import React, { useState } from 'react';
import { useViewerStore } from '../store/viewerStore';

export default function ProjectMap() {
  const { customGPS } = useViewerStore();
  const [mapMode, setMapMode] = useState('dark'); // 'dark' or 'light'
  
  let srcUrl = '';

  if (customGPS && customGPS.trim().match(/^https?:\/\//i)) {
    // If it's a URL but not an embed URL, Google blocks it via X-Frame-Options
    if (!customGPS.includes('embed') && !customGPS.includes('maps.google.com/maps?q=')) {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'white', flexDirection: 'column', padding: '20px', textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>Cannot Embed This Link</h2>
          <p>Standard Google Maps share links (maps.app.goo.gl) block embedding.</p>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px', maxWidth: '500px' }}>Please go to the <strong>Manage</strong> tab and either enter a physical text address, OR click "Share" -&gt; "Embed a map" on Google Maps and paste the <strong>HTML iframe code</strong>.</p>
        </div>
      );
    }
    srcUrl = customGPS.trim();
  } else {
    // Format the location string for the Google embed URL
    const query = customGPS ? encodeURIComponent(customGPS) : 'New+York,NY';
    srcUrl = `https://maps.google.com/maps?q=${query}&t=m&z=15&ie=UTF8&output=embed`;
  }

  // Zero-API Dark Mode hack for Google Maps (Inverts brightness, restores hue)
  const filterStyle = mapMode === 'dark' 
    ? 'invert(100%) hue-rotate(180deg) contrast(100%) grayscale(20%)' 
    : 'none';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--bg-main)' }}>
      
      {/* Floating Map Controls */}
      <div style={{ 
        position: 'absolute', top: '120px', right: '32px', zIndex: 10, 
        display: 'flex', gap: '4px', background: 'rgba(10,12,16,0.7)', 
        padding: '6px', borderRadius: '16px', backdropFilter: 'blur(10px)', 
        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' 
      }}>
        {['dark', 'light'].map(mode => (
          <button
            key={mode}
            onClick={() => setMapMode(mode)}
            className="hover-lift"
            style={{
               padding: '10px 24px', borderRadius: '12px', border: 'none',
               background: mapMode === mode ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
               color: mapMode === mode ? 'white' : 'var(--text-primary)',
               fontWeight: mapMode === mode ? 'bold' : '600', cursor: 'pointer', textTransform: 'capitalize',
               transition: 'all 0.3s ease',
               boxShadow: mapMode === mode ? '0 4px 16px var(--accent-glow)' : 'none'
            }}
          >
             {mode} Mode
          </button>
        ))}
      </div>

      {/* Zero-API Google Maps Embedding */}
      <iframe 
        width="100%" 
        height="100%" 
        style={{ border: 0, filter: filterStyle, transition: 'filter 0.5s ease' }}
        loading="lazy" 
        allowFullScreen 
        src={srcUrl}
      ></iframe>
    </div>
  );
}
