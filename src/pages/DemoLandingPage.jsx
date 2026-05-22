import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Image, Layers, LayoutGrid, MessageSquare, Smartphone, ArrowRight, Map, Video, Settings, ChevronUp, Check } from 'lucide-react';
import ShaderBackground from '../components/ShaderBackground';

export default function DemoLandingPage() {
  const scrollContainerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleScroll = (e) => {
    setShowScrollTop(e.target.scrollTop > 600);
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      style={{
        fontFamily: '"Outfit", "Inter", sans-serif',
        background: '#04060b', // Deep cyber dark
        color: '#f8fafc',
        height: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      {/* Dynamic Interactive WebGL Background */}
      <ShaderBackground />

      {/* NAVBAR */}
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 100, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '24px 48px', 
        background: 'linear-gradient(180deg, rgba(4,6,11,0.8) 0%, rgba(4,6,11,0) 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(56, 189, 248, 0.35)'
          }}>
            <Box color="#fff" size={22} />
          </div>
          <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '3px', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PROTECH</span>
        </div>
        <div>
          <Link to="/" style={{ 
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
            color: 'white', 
            textDecoration: 'none', 
            padding: '14px 36px', 
            borderRadius: '30px', 
            fontWeight: '800', 
            fontSize: '15px', 
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
          }}
          className="hover-lift"
          >
            View Live App <ArrowRight size={18} />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', textAlign: 'center', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, transparent 30%, #04060b 95%)', zIndex: 0 }} />
        
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', animation: 'fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
          <div style={{ 
            display: 'inline-block', 
            border: '1px solid rgba(56, 189, 248, 0.35)', 
            borderRadius: '50px', 
            padding: '8px 24px', 
            color: '#38bdf8', 
            fontWeight: '800', 
            fontSize: '13px', 
            marginBottom: '28px', 
            background: 'rgba(56, 189, 248, 0.08)',
            letterSpacing: '2px',
            boxShadow: '0 4px 16px rgba(56, 189, 248, 0.15)'
          }}>
            THE FUTURE OF REAL ESTATE
          </div>
          <h1 style={{ 
            fontSize: '96px', 
            fontWeight: '900', 
            lineHeight: 1.05, 
            letterSpacing: '-4px', 
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Immersive <br />
            <span style={{ background: 'linear-gradient(90deg, #38bdf8, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Architecture.</span>
          </h1>
          <p className="hero-p" style={{ fontSize: '24px', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 40px', fontWeight: '500', lineHeight: 1.5 }}>
            Ditch static PDFs. Deliver interactive, full-scale 3D experiences directly in your client's browser.
          </p>
          <div className="hero-feature-pills" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', maxWidth: '850px', margin: '0 auto' }}>
            {[
              { label: 'AR Technology', icon: <Smartphone size={16} color="#eab308" /> },
              { label: '3D WebGL Viewer', icon: <Box size={16} color="#3b82f6" /> },
              { label: 'Cinematic Gallery', icon: <Image size={16} color="#10b981" /> },
              { label: 'Smart Floorplans', icon: <Layers size={16} color="#8b5cf6" /> },
              { label: '360° Tours', icon: <Map size={16} color="#f59e0b" /> },
              { label: 'Live Inventory', icon: <LayoutGrid size={16} color="#ec4899" /> },
              { label: 'Video Hub', icon: <Video size={16} color="#14b8a6" /> },
              { label: 'AI Concierge', icon: <MessageSquare size={16} color="#06b6d4" /> },
              { label: 'CMS Manager', icon: <Settings size={16} color="#f97316" /> }
            ].map(feat => (
              <span className="hero-feature-pill" key={feat.label} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: 'rgba(10, 14, 22, 0.45)', 
                border: '1px solid rgba(255,255,255,0.06)', 
                padding: '10px 22px', 
                borderRadius: '50px', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#f8fafc', 
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
              }}>
                {feat.icon} {feat.label}
              </span>
            ))}
          </div>
        </div>

        {/* CSS KEYFRAMES */}
        <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .bento-card {
            background: rgba(8, 12, 20, 0.55);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 32px;
            padding: 48px;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.45);
          }
          .bento-card:hover {
            border-color: rgba(139, 92, 246, 0.25);
            background: rgba(12, 16, 28, 0.65);
            transform: translateY(-8px) scale(1.01);
            box-shadow: 0 35px 70px rgba(0,0,0,0.65), 0 0 40px rgba(139, 92, 246, 0.15);
          }
          .bento-img {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            width: 100%; height: 100%;
            object-fit: cover;
            z-index: 0;
            opacity: 0.35;
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .bento-card:hover .bento-img {
            opacity: 0.75;
            transform: scale(1.04);
          }
          .bento-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(0deg, rgba(4,6,11,0.95) 0%, rgba(4,6,11,0.3) 100%);
            z-index: 1;
            transition: all 0.5s ease;
          }
          .bento-card:hover .bento-overlay {
            background: linear-gradient(0deg, rgba(4,6,11,0.85) 0%, rgba(4,6,11,0.1) 100%);
          }
          .bento-content {
            position: relative;
            z-index: 2;
          }
          @media (max-width: 1000px) {
            .bento-card {
               grid-column: span 12 !important;
            }
          }
          @media (max-width: 768px) {
            h1 { font-size: 56px !important; margin-bottom: 24px !important; line-height: 1.1 !important; }
            .hero-p { font-size: 18px !important; padding: 0 16px !important; }
            nav { padding: 16px 24px !important; }
            nav span { font-size: 20px !important; }
            .bento-card { padding: 32px 24px !important; height: auto !important; min-height: 380px !important; }
            .bento-card h3 { font-size: 26px !important; }
            .bento-card p { font-size: 16px !important; }
            .hero-feature-pills { gap: 8px !important; }
            .hero-feature-pill { padding: 8px 16px !important; font-size: 13px !important; }
            .everything-title { font-size: 44px !important; margin-bottom: 50px !important; }
            section { padding: 60px 20px !important; }
          }
        `}</style>
      </section>

      {/* BENTO GRID */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 40px', position: 'relative', zIndex: 1 }}>
        <h2 className="everything-title" style={{ fontSize: '64px', fontWeight: '900', marginBottom: '80px', textAlign: 'center', letterSpacing: '-2px', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Everything you need.</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '28px', gridAutoRows: 'minmax(420px, auto)' }}>
          
          {/* Main AR Card (Span 8) */}
          <div className="bento-card" style={{ gridColumn: 'span 8' }}>
            <img src="/mockups/ar_technology.png" className="bento-img" alt="AR" style={{ objectPosition: 'center 30%' }} />
            <div className="bento-overlay" />
            <div className="bento-content">
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '16px', 
                background: 'rgba(234, 179, 8, 0.1)', 
                border: '1px solid rgba(234, 179, 8, 0.3)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(234, 179, 8, 0.15)'
              }}>
                <Smartphone size={32} color="#eab308" />
              </div>
              <h3 style={{ fontSize: '38px', fontWeight: '900', marginBottom: '16px', letterSpacing: '-1px' }}>Augmented Reality Natively</h3>
              <p style={{ color: '#94a3b8', fontSize: '20px', maxWidth: '520px', lineHeight: '1.6', fontWeight: '500' }}>Project massive 3D models at true scale straight onto your client's desk using native device capabilities.</p>
            </div>
          </div>

          {/* Render Gallery (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/render_gallery.png" className="bento-img" alt="Renders" />
            <div className="bento-overlay" />
            <div className="bento-content">
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '16px', 
                background: 'rgba(16, 185, 129, 0.1)', 
                border: '1px solid rgba(16, 185, 129, 0.3)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)'
              }}>
                <Image size={32} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.5px' }}>Cinematic Gallery</h3>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6', fontWeight: '500' }}>Curated high-fidelity visual assets organized and structured perfectly.</p>
            </div>
          </div>

          {/* 3D Viewer (Span 12) */}
          <div className="bento-card" style={{ gridColumn: 'span 12', height: '600px' }}>
             <img src="/mockups/3d_viewer.png" className="bento-img" alt="3D Viewer" style={{ objectPosition: 'center 40%' }} />
             <div className="bento-overlay" style={{ background: 'linear-gradient(90deg, rgba(4,6,11,0.98) 0%, rgba(4,6,11,0.2) 100%)' }} />
             <div className="bento-content" style={{ maxWidth: '600px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '24px', 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  border: '1px solid rgba(59, 130, 246, 0.3)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: '32px',
                  boxShadow: '0 12px 32px rgba(59, 130, 246, 0.2)'
                }}>
                  <Box size={44} color="#3b82f6" />
                </div>
                <h3 style={{ fontSize: '64px', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-2px', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Unmatched <br/> WebGL Power.</h3>
                <p style={{ color: '#94a3b8', fontSize: '22px', lineHeight: '1.6', fontWeight: '500' }}>Allow clients to freely orbit, walk through, and explore the architecture in real-time at a buttery smooth 60 FPS.</p>
             </div>
          </div>

          {/* AI Concierge (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4', padding: 0, display: 'flex', flexDirection: 'column', height: '480px' }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(6,182,212,0.4)' }}>
                <MessageSquare size={24} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#f8fafc' }}>AI Sales Agent</h3>
                <span style={{ fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} /> Online 24/7
                </span>
              </div>
            </div>
            
            {/* Chat Body */}
            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(180deg, rgba(4,6,11,0) 0%, rgba(6,182,212,0.05) 100%)', overflow: 'hidden' }}>
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.04)', padding: '14px 18px', borderRadius: '18px 18px 18px 4px', maxWidth: '85%', border: '1px solid rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#e2e8f0', lineHeight: '1.5', fontWeight: '500' }}>Hi! I'm Emma. Would you like to see the penthouse floorplan?</p>
              </div>

              <div style={{ alignSelf: 'flex-end', background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)', padding: '14px 18px', borderRadius: '18px 18px 4px 18px', maxWidth: '85%', boxShadow: '0 6px 16px rgba(6,182,212,0.25)' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'white', lineHeight: '1.5', fontWeight: '600' }}>Yes, what is the price?</p>
              </div>
            </div>

            {/* Chat Input */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(4,6,11,0.6)' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Type a message...</span>
                <div style={{ background: '#06b6d4', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRight size={16} color="white" />
                </div>
              </div>
            </div>
          </div>

          {/* Live Inventory (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/availability_grid.png" className="bento-img" alt="Inventory" />
            <div className="bento-overlay" />
            <div className="bento-content">
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '16px', 
                background: 'rgba(236, 72, 153, 0.1)', 
                border: '1px solid rgba(236, 72, 153, 0.3)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(236, 72, 153, 0.15)'
              }}>
                <LayoutGrid size={32} color="#ec4899" />
              </div>
              <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.5px' }}>Live Inventory</h3>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6', fontWeight: '500' }}>Real-time availability synchronization with our centralized cloud database.</p>
            </div>
          </div>

          {/* Floorplans (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/floorplan.png" className="bento-img" alt="Floorplan" />
            <div className="bento-overlay" />
            <div className="bento-content">
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '16px', 
                background: 'rgba(139, 92, 246, 0.1)', 
                border: '1px solid rgba(139, 92, 246, 0.3)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.15)'
              }}>
                <Layers size={32} color="#8b5cf6" />
              </div>
              <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.5px' }}>Smart Floorplans</h3>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6', fontWeight: '500' }}>Multi-level vector navigation with active room highlights.</p>
            </div>
          </div>

          {/* 360 Tours (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/spatial_tour.png" className="bento-img" alt="360 Tours" />
            <div className="bento-overlay" />
            <div className="bento-content">
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '16px', 
                background: 'rgba(245, 158, 11, 0.1)', 
                border: '1px solid rgba(245, 158, 11, 0.3)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)'
              }}>
                <Map size={32} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.5px' }}>360° Tours</h3>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6', fontWeight: '500' }}>Photorealistic virtual panoramas with responsive navigation hotspots.</p>
            </div>
          </div>

          {/* Cinematic Video (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/video_hub.png" className="bento-img" alt="Video Hub" />
            <div className="bento-overlay" />
            <div className="bento-content">
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '16px', 
                background: 'rgba(20, 184, 166, 0.1)', 
                border: '1px solid rgba(20, 184, 166, 0.3)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(20, 184, 166, 0.15)'
              }}>
                <Video size={32} color="#14b8a6" />
              </div>
              <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.5px' }}>Video Hub</h3>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6', fontWeight: '500' }}>Distraction-free theater system highlighting architectural cinematography.</p>
            </div>
          </div>

          {/* Asset Manager (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/asset_manager.png" className="bento-img" alt="Asset Manager" />
            <div className="bento-overlay" />
            <div className="bento-content">
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '16px', 
                background: 'rgba(249, 115, 22, 0.1)', 
                border: '1px solid rgba(249, 115, 22, 0.3)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '24px',
                boxShadow: '0 8px 24px rgba(249, 115, 22, 0.15)'
              }}>
                <Settings size={32} color="#f97316" />
              </div>
              <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.5px' }}>CMS Manager</h3>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6', fontWeight: '500' }}>Full property detail and media upload control via secure admin panel.</p>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 20px', textAlign: 'center', background: 'rgba(4,6,11,0.9)', borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
        <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '600' }}>
          Designed and developed by <a href="https://progressivetechnologies.com.cy" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '800' }}>Progressive Technologies</a>
        </p>
      </footer>

      {/* BACK TO TOP BUTTON */}
      <button 
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
          color: '#ffffff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          opacity: showScrollTop ? 1 : 0,
          transform: showScrollTop ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: showScrollTop ? 'auto' : 'none',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 10px 30px rgba(139,92,246,0.4)',
          zIndex: 1000
        }}
        aria-label="Scroll to top"
        className="hover-lift"
      >
        <ChevronUp size={28} />
      </button>

    </div>
  );
}
