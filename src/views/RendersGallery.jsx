import React from 'react';
import { useViewerStore } from '../store/viewerStore';

export default function RendersGallery() {
  const { customRenders } = useViewerStore();
  const displayImages = customRenders.length > 0 ? customRenders : [1, 2, 3, 4, 5, 6];

  return (
    <div style={{ padding: '120px 32px 32px', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: '300' }}>Photorealistic Renders</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px',
        paddingBottom: '32px'
      }}>
        {displayImages.map((src, i) => (
          <div key={i} className="glass-panel hover-lift" style={{ 
             height: '250px', 
             background: typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('http')) ? `url(${src}) center/cover` : `linear-gradient(45deg, #1f2937, #111827)`,
             display: 'flex', alignItems: 'center', justifyContent: 'center',
             color: 'rgba(255,255,255,0.2)', fontSize: '14px',
             borderRadius: '12px', overflow: 'hidden'
          }}>
            {typeof src === 'number' && `Render Placeholder ${src}`}
          </div>
        ))}
      </div>
    </div>
  );
}
