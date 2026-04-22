import React, { useState, useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { Component, ArrowRight } from 'lucide-react';

export default function ProjectOverview({ onNavigate }) {
  const { customRenders } = useViewerStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Enforce pure database logic, NO dummy data
  const images = customRenders || [];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, [images.length]);

  const handleMouseMove = (e) => {
    // Normalize coordinates between -1 and 1
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    setMousePos({ x, y });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--bg-dark)', perspective: '1000px' }}
    >
      
      {/* Slideshow Background */}
      {images.map((src, index) => {
        // Build background string inline if it's a blob object URL or string
        const isString = typeof src === 'string';
        const bgImg = isString ? `url(${src})` : 'none';
        
        return (
          <div 
            key={index}
            style={{
              position: 'absolute', top: '-5%', left: '-5%', width: '110%', height: '110%',
              opacity: index === currentSlide ? 1 : 0,
              transform: `rotateX(${mousePos.y * -4}deg) rotateY(${mousePos.x * 4}deg)`,
              transition: 'opacity 1.5s ease-in-out, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
              zIndex: index === currentSlide ? 1 : 0,
              transformStyle: 'preserve-3d',
              willChange: 'transform'
            }}
          >
            <div style={{
              width: '100%', height: '100%',
              background: isString ? `${bgImg} center/cover no-repeat` : 'linear-gradient(45deg, #1f2937, #111827)',
              animation: index === currentSlide ? 'kenburnsFade 6.5s ease-in-out forwards' : 'none',
              willChange: 'transform'
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

      {/* Cinematic Letterbox Bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '10vh', background: '#000', zIndex: 10, boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '10vh', background: '#000', zIndex: 10, boxShadow: '0 -20px 40px rgba(0,0,0,0.8)' }}></div>

      {/* Content Block */}
      <div style={{
        position: 'absolute', bottom: '10vh', left: 0, zIndex: 20,
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
