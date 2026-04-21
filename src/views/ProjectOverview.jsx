import React, { useState, useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { Component, ArrowRight } from 'lucide-react';

export default function ProjectOverview({ onNavigate }) {
  const { customRenders } = useViewerStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Use custom uploaded renders if available, otherwise placeholders
  const images = customRenders.length > 0 ? customRenders : [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--bg-dark)' }}>
      
      {/* Slideshow Background */}
      {images.map((src, index) => {
        // Build background string inline if it's a blob object URL or string
        const isString = typeof src === 'string';
        const bgImg = isString ? `url(${src})` : 'none';
        
        return (
          <div 
            key={index}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: isString ? `${bgImg} center/cover no-repeat` : 'linear-gradient(45deg, #1f2937, #111827)',
              opacity: index === currentSlide ? 1 : 0,
              animation: index === currentSlide ? 'kenburnsFade 6.5s ease-in-out forwards' : 'none',
              zIndex: index === currentSlide ? 1 : 0,
            }}
          />
        );
      })}

      {/* Dark Overlay for Readability */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle at center, rgba(10,12,16,0.3) 0%, rgba(10,12,16,0.8) 100%)',
        zIndex: 2
      }} />

      {/* Content Block */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, zIndex: 10,
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
