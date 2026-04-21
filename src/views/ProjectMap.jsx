import React from 'react';
import { useViewerStore } from '../store/viewerStore';

export default function ProjectMap() {
  const { customGPS } = useViewerStore();
  
  // Format the location string for the Google embed URL
  const query = customGPS ? encodeURIComponent(customGPS) : 'New+York,NY';
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Fallback to simple placeholder until Google Maps API key provided */}
      <iframe 
        width="100%" 
        height="100%" 
        style={{ border: 0 }}
        loading="lazy" 
        allowFullScreen 
        src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${query}`}
      ></iframe>
      
      {/* Dev Overlay since API key is missing */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
        background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
          <p>Google Maps embedded for <strong>{customGPS || 'New York, NY'}</strong></p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>(Requires mapping API key in production)</p>
        </div>
      </div>
    </div>
  );
}
