import React from 'react';
import { useViewerStore } from '../store/viewerStore';

export default function ProjectMap() {
  const { customGPS } = useViewerStore();
  
  let srcUrl = '';

  if (customGPS && customGPS.trim().match(/^https?:\/\//i)) {
    // If it's a URL but not an embed URL, Google blocks it via X-Frame-Options
    if (!customGPS.includes('embed') && !customGPS.includes('maps.google.com/maps?q=')) {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)', color: 'white', flexDirection: 'column', padding: '20px', textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>Cannot Embed This Link</h2>
          <p>Standard Google Maps share links (maps.app.goo.gl) block embedding.</p>
          <p style={{ color: 'var(--text-secondary)', marginTop: '10px', maxWidth: '500px' }}>Please go to the <strong>Manage</strong> tab and either enter a physical text address, OR click "Share" -> "Embed a map" on Google Maps and paste the <strong>HTML iframe code</strong>.</p>
        </div>
      );
    }
    srcUrl = customGPS.trim();
  } else {
    // Format the location string for the Google embed URL
    const query = customGPS ? encodeURIComponent(customGPS) : 'New+York,NY';
    srcUrl = `https://maps.google.com/maps?q=${query}&t=m&z=15&ie=UTF8&output=embed`;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Zero-API Google Maps Embedding */}
      <iframe 
        width="100%" 
        height="100%" 
        style={{ border: 0 }}
        loading="lazy" 
        allowFullScreen 
        src={srcUrl}
      ></iframe>
    </div>
  );
}
