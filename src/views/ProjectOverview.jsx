import React, { useState, useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { Component, ArrowRight } from 'lucide-react';

export default function ProjectOverview({ onNavigate }) {
  const { customRenders } = useViewerStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Enforce pure database logic, NO dummy data
  let images = customRenders || [];
  const slideshowRenders = images
    .filter(r => r.is_overview === true)
    .sort((a, b) => (a.overview_order || 0) - (b.overview_order || 0));
  
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
        <style>{`
          .overview-content { padding: 40px 32px; }
          .overview-title { font-size: 48px; }
          .overview-desc { font-size: 18px; padding: 0 16px; }
          .overview-btn { font-size: 18px; padding: 16px 32px; }
          
          @media (max-width: 768px) {
            .overview-content { padding: 32px 16px 100px; } /* Extra bottom padding for mobile menu clearance */
            .overview-title { font-size: 32px; margin-bottom: 12px !important; }
            .overview-desc { font-size: 15px; padding: 0; }
            .overview-btn { font-size: 16px; padding: 14px 24px; }
          }
        `}</style>
        
        <div className="overview-content" style={{ 
          background: 'linear-gradient(to top, rgba(10, 12, 16, 0.95) 0%, rgba(10, 12, 16, 0.6) 50%, transparent 100%)',
          textAlign: 'center',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}>
          <h1 className="overview-title" style={{ fontWeight: '700', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            The Pinnacle Residence
          </h1>
          <p className="overview-desc" style={{ color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '100%', margin: '0 auto 32px' }}>
            Welcome to the ultimate expression of modern architectural design. 
            Nestled in the prestigious hills, this property features breathtaking panoramic 
            views, seamless indoor-outdoor living, and state-of-the-art cinematic finishes. 
          </p>

          <button 
            className="hover-lift overview-btn"
            onClick={() => onNavigate('3d')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              borderRadius: '40px',
              border: 'none', background: 'var(--accent-color)', color: 'white',
              fontWeight: '600', cursor: 'pointer',
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
