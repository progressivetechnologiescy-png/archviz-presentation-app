import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Image, Map, Layers, LayoutGrid, MessageSquare, Video, Settings, Play, ArrowRight, CheckCircle, Smartphone } from 'lucide-react';

function useOnScreen(ref, rootMargin = '0px') {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    // Scroll the container to top, not window
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIntersecting(true);
    }, { rootMargin, threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return isIntersecting;
}

const FadeIn = ({ children, delay = 0, direction = 'up' }) => {
  const ref = useRef();
  const isVisible = useOnScreen(ref);
  
  let transform = 'translateY(40px)';
  if (direction === 'left') transform = 'translateX(-40px)';
  if (direction === 'right') transform = 'translateX(40px)';

  return (
    <div ref={ref} style={{
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translate(0)' : transform,
      transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      width: '100%'
    }}>
      {children}
    </div>
  );
};

export default function DemoLandingPage() {
  const [heroPhase, setHeroPhase] = useState('title');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setHeroPhase('zoom-out');
      const timer2 = setTimeout(() => {
        setHeroPhase('features');
      }, 1000); 
      return () => clearTimeout(timer2);
    }, 2000);
    return () => clearTimeout(timer1);
  }, []);

  return (
    <div style={{ 
      fontFamily: '"Inter", "Outfit", sans-serif', 
      background: '#050505', 
      color: '#ffffff', 
      overflowX: 'hidden',
      overflowY: 'auto',
      height: '100vh',
      width: '100vw'
    }}>
      
      {/* Dynamic Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto' }}>
          <Box color="#3b82f6" size={28} />
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '1px' }}>3DS PLATFORM</span>
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <Link to="/" style={{ background: '#3b82f6', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: '50px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}>
            Launch App Demo <Play fill="white" size={16} />
          </Link>
        </div>
      </nav>

      <style>{`
        @keyframes float {
          0% { transform: translate(-50%, 0px); }
          50% { transform: translate(-50%, -20px); }
          100% { transform: translate(-50%, 0px); }
        }
        @keyframes text-float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse-glow {
          0% { opacity: 0.15; }
          50% { opacity: 0.3; }
          100% { opacity: 0.15; }
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes hero-zoom-out {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); filter: blur(10px); }
        }
        @keyframes hero-fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .hero-title {
          animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards, text-float 6s ease-in-out infinite alternate 1s;
        }
        .hero-title-zoom {
          animation: hero-zoom-out 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .hero-features {
          animation: hero-fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .hero-subtitle {
          animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards, text-float 6s ease-in-out infinite alternate 1.2s;
          opacity: 0;
        }
      `}</style>

      {/* HERO REDESIGNED */}
      <section style={{ 
        position: 'relative', 
        height: '100vh', 
        minHeight: '800px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Fullscreen Video Background */}
        <video
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            zIndex: 0
          }}
        />

        {/* Cinematic Gradient Overlays */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.4) 40%, rgba(5,5,5,0.6) 100%)', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(5,5,5,0.8) 100%)', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 3, maxWidth: '1000px', padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {heroPhase !== 'features' && (
            <div className={heroPhase === 'zoom-out' ? 'hero-title-zoom' : 'hero-title'}>
              <h1 style={{ fontSize: '84px', fontWeight: '900', lineHeight: '1.05', marginBottom: '32px', letterSpacing: '-2px', textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
                Experience <span style={{ color: '#3b82f6' }}>Unbuilt</span> <br/>
                <span style={{ color: '#fff', WebkitTextStroke: '1px rgba(255,255,255,0.5)', textShadow: '0 0 40px rgba(255,255,255,0.2)' }}>Architecture.</span>
              </h1>
              <p className={heroPhase === 'zoom-out' ? '' : 'hero-subtitle'} style={{ fontSize: '24px', color: '#e4e4e7', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6', textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
                The ultimate 3D presentation platform. Interactive web-based models, high-fidelity renders, and integrated CRM—all in one seamless experience.
              </p>
            </div>
          )}

          {heroPhase === 'features' && (
            <div className="hero-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', maxWidth: '900px', textAlign: 'left', width: '100%' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                <Box size={32} color="#3b82f6" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Interactive 3D WebGL</h3>
                <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>Explore architecture in real-time right in the browser with no plugins required.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                <Image size={32} color="#10b981" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>High-Res Render Gallery</h3>
                <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>Showcase stunning photorealistic assets in a distraction-free cinematic lightbox.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                <Layers size={32} color="#8b5cf6" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Multi-Level Floorplans</h3>
                <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>Interactive, high-resolution scalable floorplans with dynamic unit selection.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                <MessageSquare size={32} color="#06b6d4" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>Emma: AI Concierge</h3>
                <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>A fully integrated, context-aware AI assistant built natively into the interface.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FEATURE 1: 3D VIEWER */}
      <FeatureSection 
        reversed={false}
        icon={<Box size={40} color="#3b82f6" />}
        title="Interactive 3D WebGL Viewer"
        description="Allow clients to freely orbit, walk through, and explore the architecture in real-time. Our optimized WebGL engine runs massive FBX and GLB files directly in the browser at 60FPS."
        features={[
          "First-person game-like movement controls",
          "Real-time material swapping (e.g., Marble vs Wood)",
          "Dynamic time-of-day lighting (Morning, Noon, Night)",
          "Cross-platform WebXR support for VR headsets"
        ]}
        imageUrl="/mockups/3d_viewer.png"
      />

      {/* FEATURE 2: RENDERS */}
      <FeatureSection 
        reversed={true}
        icon={<Image size={40} color="#10b981" />}
        title="High-Res Render Gallery"
        description="A beautiful, distraction-free gallery to showcase your highest quality static assets. Organized logically so you can tell the perfect visual story."
        features={[
          "Categorized folders (e.g., Interiors, Exteriors, Amenities)",
          "Fullscreen immersive lightbox viewing",
          "Automated background image slideshow mode",
          "Favorites system to star the best shots"
        ]}
        imageUrl="/mockups/render_gallery.png"
      />

      {/* FEATURE 3: FLOORPLANS */}
      <FeatureSection 
        reversed={false}
        icon={<Layers size={40} color="#8b5cf6" />}
        title="Multi-Level Floorplans"
        description="Say goodbye to confusing PDFs. Interactive floorplans allow clients to switch between building levels and explore individual units with clarity."
        features={[
          "Level selector (Ground Floor, Level 1, Penthouse)",
          "High-resolution SVG and PNG support",
          "Interactive panning and zooming",
          "Seamless transition into 360 tours"
        ]}
        imageUrl="/mockups/floorplan.png"
      />

      {/* FEATURE 4: 360 TOURS */}
      <FeatureSection 
        reversed={true}
        icon={<Map size={40} color="#f59e0b" />}
        title="360° Spatial Tours"
        description="Transport buyers directly inside the property. Link multiple panoramic renders together to create a photorealistic virtual walkthrough."
        features={[
          "Interactive teleportation hotspots",
          "Information tags pinned to specific objects",
          "Gyroscope support for mobile devices",
          "High-performance equirectangular rendering"
        ]}
        imageUrl="/mockups/spatial_tour.png"
      />

      {/* FEATURE 5: AVAILABILITY GRID */}
      <FeatureSection 
        reversed={false}
        icon={<LayoutGrid size={40} color="#ec4899" />}
        title="Live Availability & Inventory"
        description="Never sell the same unit twice. The application connects directly to a live Supabase database to show real-time unit statuses."
        features={[
          "Color-coded statuses (Available, Reserved, Sold)",
          "Instant filtering by Beds, Baths, or Price",
          "Detailed unit specifications and metrics",
          "Direct lead capture forms for specific units"
        ]}
        imageUrl="/mockups/availability_grid.png"
      />

      {/* FEATURE 6: CINEMATIC VIDEO */}
      <FeatureSection 
        reversed={true}
        icon={<Video size={40} color="#14b8a6" />}
        title="Cinematic Video Hub"
        description="Keep all your high-budget architectural fly-throughs in one place without leaving the app experience."
        features={[
          "Embedded YouTube loop support",
          "Direct MP4 playback",
          "Distraction-free theater mode",
          "Use videos as ambient app backgrounds"
        ]}
        imageUrl="/mockups/video_hub.png"
      />

      {/* FEATURE 7: AI CONCIERGE */}
      <FeatureSection 
        reversed={false}
        icon={<MessageSquare size={40} color="#06b6d4" />}
        title="Emma: The AI Agent"
        description="A floating, context-aware AI assistant built right into the interface. Emma is trained specifically on your property's data."
        features={[
          "Answers complex questions about amenities and pricing",
          "Multi-lingual support out of the box",
          "Understands the current 3D view context",
          "Books viewings and captures lead data 24/7"
        ]}
        imageUrl="/mockups/ai_concierge.png"
      />

      {/* FEATURE 8: ASSET MANAGER */}
      <FeatureSection 
        reversed={true}
        icon={<Settings size={40} color="#f97316" />}
        title="Full CMS Asset Manager"
        description="You have complete control over the application. Our built-in admin panel lets you update assets without writing a single line of code."
        features={[
          "Bulk folder upload for 3D Models (FBX, GLB, OBJ)",
          "Drag-and-drop render and floorplan management",
          "Global theme customization (Colors, Light/Dark mode)",
          "Database synchronization"
        ]}
        imageUrl="/mockups/asset_manager.png"
      />

      {/* FINAL CTA */}
      <section style={{ padding: '120px 20px', textAlign: 'center', background: 'linear-gradient(180deg, #050505 0%, #1e3a8a 100%)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '24px' }}>See all features in action.</h2>
          <p style={{ fontSize: '20px', color: '#a1a1aa', marginBottom: '40px' }}>
            Click below to launch the live 3D Viewer application.
          </p>
          <Link to="/" style={{
            background: '#ffffff', color: '#000000', textDecoration: 'none',
            padding: '20px 48px', borderRadius: '50px', fontSize: '20px', fontWeight: 'bold',
            display: 'inline-flex', alignItems: 'center', gap: '12px'
          }}>
            Launch the App <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: '#a1a1aa', fontSize: '14px' }}>
          Designed by <a href="https://progressivetechnologies.com.cy" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>Progressive Technologies</a>
        </p>
      </footer>

    </div>
  );
}

// Reusable Section Component
function FeatureSection({ reversed, icon, title, description, features, imageUrl, mockupColor, mockupIcon, mockupLabel }) {
  return (
    <section style={{ padding: '100px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ 
        maxWidth: '1200px', margin: '0 auto', display: 'flex', 
        flexDirection: reversed ? 'row-reverse' : 'row', 
        flexWrap: 'wrap', gap: '80px', alignItems: 'center' 
      }}>
        
        {/* TEXT CONTENT */}
        <div style={{ flex: '1 1 400px' }}>
          <FadeIn direction={reversed ? 'right' : 'left'}>
            <div style={{ marginBottom: '24px' }}>{icon}</div>
            <h2 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.2' }}>{title}</h2>
            <p style={{ fontSize: '18px', color: '#a1a1aa', marginBottom: '32px', lineHeight: '1.6' }}>{description}</p>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {features.map((feat, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '16px', color: '#e4e4e7' }}>
                  <CheckCircle size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                  {feat}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>

        {/* MOCKUP IMAGE OR PLACEHOLDER */}
        <div style={{ flex: '1 1 500px' }}>
          <FadeIn direction={reversed ? 'left' : 'right'} delay={0.2}>
            {imageUrl ? (
              <div style={{ 
                width: '100%', borderRadius: '24px', overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <img src={imageUrl} alt={title} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
              </div>
            ) : (
              <div style={{ 
                width: '100%', aspectRatio: '16/10', borderRadius: '24px', 
                background: mockupColor, border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden'
              }}>
                {/* Subtle glass reflection */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)', pointerEvents: 'none' }} />
                
                {mockupIcon}
                <div style={{ marginTop: '24px', color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace', fontSize: '16px', textAlign: 'center', padding: '0 20px', fontWeight: 'bold' }}>
                  {mockupLabel}
                </div>
              </div>
            )}
          </FadeIn>
        </div>

      </div>
    </section>
  );
}
