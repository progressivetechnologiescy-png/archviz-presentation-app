import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Box, Image, Layers, LayoutGrid, MessageSquare, Smartphone, ArrowRight, Map, Video, Settings } from 'lucide-react';

export default function DemoLandingPage2() {
  const scrollContainerRef = useRef(null);

  return (
    <div 
      ref={scrollContainerRef}
      style={{
        fontFamily: '"Outfit", "Inter", sans-serif',
        background: '#020617', // Very dark slate
        color: '#f8fafc',
        height: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        overflowY: 'auto'
      }}
    >
      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 48px', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Box color="#38bdf8" size={32} />
          <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '2px', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PROTECH</span>
        </div>
        <div>
          <Link to="/" style={{ background: '#f8fafc', color: '#0f172a', textDecoration: 'none', padding: '12px 32px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px' }}>
            View Live App <ArrowRight size={18} />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px', textAlign: 'center' }}>
        <video src="/hero-video.mp4" autoPlay loop muted playsInline style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, transparent 0%, #020617 100%)', zIndex: 1 }} />
        
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', animation: 'fade-in-up 1s ease-out forwards' }}>
          <div style={{ display: 'inline-block', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '50px', padding: '8px 24px', color: '#38bdf8', fontWeight: 'bold', fontSize: '14px', marginBottom: '24px', background: 'rgba(56, 189, 248, 0.05)' }}>
            THE FUTURE OF REAL ESTATE
          </div>
          <h1 style={{ fontSize: '96px', fontWeight: '900', lineHeight: 1, letterSpacing: '-3px', marginBottom: '32px' }}>
            Immersive <br />
            <span style={{ color: '#38bdf8' }}>Architecture.</span>
          </h1>
          <p style={{ fontSize: '24px', color: '#94a3b8', maxWidth: '700px', margin: '0 auto 48px' }}>
            Ditch the static PDFs. Deliver interactive, full-scale 3D experiences right in your client's browser.
          </p>
        </div>

        {/* CSS KEYFRAMES */}
        <style>{`
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .bento-card {
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 32px;
            padding: 40px;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
          }
          .bento-card:hover {
            border-color: rgba(255,255,255,0.15);
            background: rgba(255,255,255,0.04);
            transform: translateY(-8px);
            box-shadow: 0 30px 60px rgba(0,0,0,0.6);
          }
          .bento-img {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            width: 100%; height: 100%;
            object-fit: cover;
            z-index: 0;
            opacity: 0.5;
            transition: opacity 0.5s ease;
          }
          .bento-card:hover .bento-img {
            opacity: 0.9;
          }
          .bento-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(0deg, rgba(2,6,23,1) 0%, rgba(2,6,23,0.3) 100%);
            z-index: 1;
            transition: background 0.5s ease;
          }
          .bento-card:hover .bento-overlay {
            background: linear-gradient(0deg, rgba(2,6,23,0.9) 0%, rgba(2,6,23,0.1) 100%);
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
        `}</style>
      </section>

      {/* BENTO GRID */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 40px' }}>
        <h2 style={{ fontSize: '56px', fontWeight: '900', marginBottom: '80px', textAlign: 'center', letterSpacing: '-2px' }}>Everything you need.</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', gridAutoRows: 'minmax(400px, auto)' }}>
          
          {/* Main AR Card (Span 8) */}
          <div className="bento-card" style={{ gridColumn: 'span 8' }}>
            <img src="/mockups/ar_technology.png" className="bento-img" alt="AR" style={{ objectPosition: 'center 30%' }} />
            <div className="bento-overlay" />
            <div className="bento-content">
              <Smartphone size={32} color="#eab308" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>Augmented Reality Natively</h3>
              <p style={{ color: '#94a3b8', fontSize: '20px', maxWidth: '500px', lineHeight: '1.6' }}>Project massive 3D models at true scale straight onto your client's desk using native device capabilities.</p>
            </div>
          </div>

          {/* Render Gallery (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/render_gallery.png" className="bento-img" alt="Renders" />
            <div className="bento-overlay" />
            <div className="bento-content">
              <Image size={32} color="#10b981" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Cinematic Gallery</h3>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6' }}>Curated high-fidelity assets organized perfectly.</p>
            </div>
          </div>

          {/* 3D Viewer (Span 12) */}
          <div className="bento-card" style={{ gridColumn: 'span 12', height: '600px' }}>
             <img src="/mockups/3d_viewer.png" className="bento-img" alt="3D Viewer" style={{ objectPosition: 'center 40%' }} />
             <div className="bento-overlay" style={{ background: 'linear-gradient(90deg, rgba(2,6,23,1) 0%, rgba(2,6,23,0) 100%)' }} />
             <div className="bento-content" style={{ maxWidth: '600px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box size={48} color="#3b82f6" style={{ marginBottom: '32px' }} />
                <h3 style={{ fontSize: '64px', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-2px' }}>Unmatched <br/> WebGL Power.</h3>
                <p style={{ color: '#94a3b8', fontSize: '22px', lineHeight: '1.6' }}>Allow clients to freely orbit, walk through, and explore the architecture in real-time at a buttery smooth 60 FPS.</p>
             </div>
          </div>

          {/* AI Concierge (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/ai_concierge.png" className="bento-img" alt="AI" />
            <div className="bento-overlay" />
            <div className="bento-content">
              <MessageSquare size={32} color="#06b6d4" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>AI Sales Agent</h3>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6' }}>Emma answers context-aware questions 24/7.</p>
            </div>
          </div>

          {/* Live Inventory (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/availability_grid.png" className="bento-img" alt="Inventory" />
            <div className="bento-overlay" />
            <div className="bento-content">
              <LayoutGrid size={32} color="#ec4899" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Live Inventory</h3>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6' }}>Real-time synchronization with CRM database.</p>
            </div>
          </div>

          {/* Floorplans (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/floorplan.png" className="bento-img" alt="Floorplan" />
            <div className="bento-overlay" />
            <div className="bento-content">
              <Layers size={32} color="#8b5cf6" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Smart Floorplans</h3>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6' }}>Multi-level interactive vector navigation.</p>
            </div>
          </div>

          {/* 360 Tours (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/spatial_tour.png" className="bento-img" alt="360 Tours" />
            <div className="bento-overlay" />
            <div className="bento-content">
              <Map size={32} color="#f59e0b" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>360° Tours</h3>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6' }}>Photorealistic virtual walkthroughs.</p>
            </div>
          </div>

          {/* Cinematic Video (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/video_hub.png" className="bento-img" alt="Video Hub" />
            <div className="bento-overlay" />
            <div className="bento-content">
              <Video size={32} color="#14b8a6" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>Video Hub</h3>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6' }}>Distraction-free theater mode.</p>
            </div>
          </div>

          {/* Asset Manager (Span 4) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/asset_manager.png" className="bento-img" alt="Asset Manager" />
            <div className="bento-overlay" />
            <div className="bento-content">
              <Settings size={32} color="#f97316" style={{ marginBottom: '20px' }} />
              <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>CMS Manager</h3>
              <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6' }}>Full content control via admin panel.</p>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', background: '#020617', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Designed and developed by <a href="https://progressivetechnologies.com.cy" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>Progressive Technologies</a>
        </p>
      </footer>
    </div>
  );
}
