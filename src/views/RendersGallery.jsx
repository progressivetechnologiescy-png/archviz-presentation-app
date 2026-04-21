import React, { useState, useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { X, ZoomIn } from 'lucide-react';

export default function RendersGallery() {
  const { customRenders } = useViewerStore();
  const [selectedImage, setSelectedImage] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const displayImages = customRenders;

  if (displayImages.length === 0) {
    return (
      <div style={{ padding: '120px 32px 32px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '300', marginBottom: '16px' }}>No Renders Available</h2>
        <p>Please upload high-resolution renders via the Admin panel.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '120px 32px 32px', height: '100%', overflowY: 'auto' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: '300' }}>Photorealistic Renders</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '24px',
        paddingBottom: '32px'
      }}>
        {displayImages.map((src, i) => {
          const isRealImage = typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('http'));
          return (
            <div 
              key={i} 
              className="glass-panel hover-lift" 
              onClick={() => isRealImage && setSelectedImage(src)}
              style={{ 
                 height: '250px', 
                 background: isRealImage ? `url(${src}) center/cover` : `linear-gradient(45deg, #1f2937, #111827)`,
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 color: 'rgba(255,255,255,0.2)', fontSize: '14px',
                 borderRadius: '12px', overflow: 'hidden', cursor: isRealImage ? 'zoom-in' : 'default',
                 position: 'relative'
              }}
            >
              {!isRealImage && `Render Placeholder ${src}`}
            </div>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Engine */}
      {selectedImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Close Button */}
          <button 
            onClick={() => setSelectedImage(null)}
            className="hover-lift"
            style={{
              position: 'absolute', top: '32px', right: '32px',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', width: '48px', height: '48px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2
            }}
          >
            <X size={24} />
          </button>

          {/* High Res Image */}
          <img 
            src={selectedImage} 
            alt="Fullscreen Render"
            style={{
              maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain',
              borderRadius: '8px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              userSelect: 'none'
            }}
          />
        </div>
      )}
    </div>
  );
}
