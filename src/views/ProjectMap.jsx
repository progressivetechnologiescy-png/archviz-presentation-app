import React from 'react';
import { useViewerStore } from '../store/viewerStore';

export default function ProjectMap() {
  const { customGPS } = useViewerStore();
  
  // Format the location string for the Google embed URL
  const query = customGPS ? encodeURIComponent(customGPS) : 'New+York,NY';
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Zero-API Google Maps Embedding */}
      <iframe 
        width="100%" 
        height="100%" 
        style={{ border: 0 }}
        loading="lazy" 
        allowFullScreen 
        src={`https://maps.google.com/maps?q=${query}&t=m&z=15&ie=UTF8&iwloc=&output=embed`}
      ></iframe>
    </div>
  );
}
