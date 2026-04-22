import React, { useState, useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { Component, ArrowRight } from 'lucide-react';

export default function ProjectOverview({ onNavigate }) {
  const { customRenders } = useViewerStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Enforce pure database logic, NO dummy data
  // Try to find renders tagged for 'Overview' or 'Slideshow', otherwise fallback to all images
  let images = customRenders || [];
  const slideshowRenders = images.filter(r => r.folder_name && (r.folder_name.toLowerCase() === 'overview' || r.folder_name.toLowerCase() === 'slideshow'));
  
  if (slideshowRenders.length > 0) {
    images = slideshowRenders;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 8000); // 8 seconds allows the focus pull to resolve elegantly
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--bg-dark)' }}>
      
      {/* Slideshow Background */}
      {images.map((src, index) => {
        const url = typeof src === 'string' ? src : src.image_url;
        const bgImg = url ? `url(${url})` : 'none';
        const isActive = index === currentSlide;

        return (
          <div 
            key={index}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              zIndex: isActive ? 1 : 0,
              pointerEvents: 'none'
            }}
          >
            <div style={{
              width: '100%', height: '100%',
              background: url ? `${bgImg} center/cover no-repeat` : 'linear-gradient(45deg, #1f2937, #111827)',
              animation: isActive ? 'focusPullReveal 8.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' : 'fadeOutOld 1.5s ease-out forwards',
              willChange: 'transform, filter, opacity'
            }} />
          </div>
        );
      })}

      {/* Film Grain Overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        opacity: 0.04,
        mixBlendMode: 'overlay',
        zIndex: 2,
        pointerEvents: 'none'
      }} />

      {/* Dark Overlay for Readability */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle at center, rgba(10,12,16,0.2) 0%, rgba(10,12,16,0.85) 100%)',
        zIndex: 3,
        pointerEvents: 'none'
      }} />

      {/* Content Block */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, zIndex: 20,
        width: '100%'
      }}>
        <div style={{ 
          padding: '40px 32px', 
          background: 'linear-gradient(to top, rgba(10, 12, 16, 0.8) 0%, transparent 100%)',
          textAlign: 'center',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}>
          <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            The Pinnacle Residence
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: '1.6', maxWidth: '100%', margin: '0 auto 32px', padding: '0 16px' }}>
            Welcome to the ultimate expression of modern architectural design. 
            Nestled in the prestigious hills, this property features breathtaking panoramic 
            views, seamless indoor-outdoor living, and state-of-the-art cinematic finishes. 
          </p>

          <button 
            className="hover-lift"
            onClick={() => onNavigate('3d')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              padding: '16px 32px', borderRadius: '40px',
              border: 'none', background: 'var(--accent-color)', color: 'white',
              fontSize: '18px', fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 8px 32px var(--accent-glow)'
            }}
          >
            <Component size={24} />
            Explore 3D Model
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
