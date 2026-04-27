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
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="https://progressivetechnologies.com.cy/wp-content/uploads/2024/03/progressivelogo-4.png" alt="Progressive Technologies" style={{ height: '36px', objectFit: 'contain' }} />
        </div>
        <Link to="/" style={{ background: '#3b82f6', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: '50px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s' }}>
          Launch App Demo <Play fill="white" size={16} />
        </Link>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: '180px', paddingBottom: '120px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 60%)', zIndex: 0 }} />
        
        {/* Cinematic Transparent House SVG Background */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', opacity: 0.15, zIndex: 0, width: '100%', maxWidth: '1200px', pointerEvents: 'none' }}>
          <svg viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 350 L100 150 L400 150 L400 50 L900 50 L900 200 L1100 200 L1100 350 Z" stroke="#3b82f6" strokeWidth="2" fill="url(#houseGrad)" />
            <path d="M150 350 L150 200 L350 200 L350 350" stroke="#3b82f6" strokeWidth="1" />
            <path d="M450 350 L450 100 L850 100 L850 350" stroke="#3b82f6" strokeWidth="1" />
            <path d="M500 350 L500 150 L800 150 L800 350" stroke="#3b82f6" strokeWidth="2" />
            <path d="M950 350 L950 250 L1050 250 L1050 350" stroke="#3b82f6" strokeWidth="1" />
            <defs>
              <linearGradient id="houseGrad" x1="600" y1="50" x2="600" y2="350" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6" stopOpacity="0.3"/>
                <stop offset="1" stopColor="#3b82f6" stopOpacity="0"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
          <FadeIn>
            <div style={{ display: 'inline-block', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', padding: '8px 20px', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold', marginBottom: '24px', letterSpacing: '1px' }}>
              THE COMPLETE VISUALIZATION SUITE
            </div>
            <h1 style={{ fontSize: '72px', fontWeight: '900', lineHeight: '1.1', marginBottom: '32px', letterSpacing: '-2px' }}>
              Everything you need to <br/>
              <span style={{ color: '#3b82f6' }}>showcase and sell.</span>
            </h1>
            <p style={{ fontSize: '22px', color: '#a1a1aa', maxWidth: '800px', margin: '0 auto 48px', lineHeight: '1.6' }}>
              A full-stack, interactive presentation application. Combining real-time 3D models, stunning renders, 360° tours, and live CRM data into one seamless browser experience.
            </p>
          </FadeIn>
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
        imageUrl={null}
        mockupColor="rgba(59,130,246,0.1)"
        mockupIcon={<Box size={80} color="#3b82f6" style={{ opacity: 0.5 }}/>}
        mockupLabel="UPLOAD ACTUAL APP SCREENSHOT HERE (Replace public/mockups/3d_viewer.png)"
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
        imageUrl={null}
        mockupColor="rgba(16,185,129,0.1)"
        mockupIcon={<Image size={80} color="#10b981" style={{ opacity: 0.5 }}/>}
        mockupLabel="UPLOAD ACTUAL APP SCREENSHOT HERE (Replace public/mockups/render_gallery.png)"
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
        imageUrl={null}
        mockupColor="rgba(139,92,246,0.1)"
        mockupIcon={<Layers size={80} color="#8b5cf6" style={{ opacity: 0.5 }}/>}
        mockupLabel="UPLOAD ACTUAL APP SCREENSHOT HERE (Replace public/mockups/floorplan.png)"
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
        imageUrl={null}
        mockupColor="rgba(245,158,11,0.1)"
        mockupIcon={<Map size={80} color="#f59e0b" style={{ opacity: 0.5 }}/>}
        mockupLabel="UPLOAD ACTUAL APP SCREENSHOT HERE (Replace public/mockups/spatial_tour.png)"
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
        imageUrl={null}
        mockupColor="rgba(236,72,153,0.1)"
        mockupIcon={<LayoutGrid size={80} color="#ec4899" style={{ opacity: 0.5 }}/>}
        mockupLabel="UPLOAD ACTUAL APP SCREENSHOT HERE (Replace public/mockups/availability_grid.png)"
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
        imageUrl={null}
        mockupColor="rgba(20,184,166,0.1)"
        mockupIcon={<Video size={80} color="#14b8a6" style={{ opacity: 0.5 }}/>}
        mockupLabel="UPLOAD ACTUAL APP SCREENSHOT HERE (Replace public/mockups/video_hub.png)"
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
        imageUrl={null}
        mockupColor="rgba(6,182,212,0.1)"
        mockupIcon={<MessageSquare size={80} color="#06b6d4" style={{ opacity: 0.5 }}/>}
        mockupLabel="UPLOAD ACTUAL APP SCREENSHOT HERE (Replace public/mockups/ai_concierge.png)"
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
        imageUrl={null}
        mockupColor="rgba(249,115,22,0.1)"
        mockupIcon={<Settings size={80} color="#f97316" style={{ opacity: 0.5 }}/>}
        mockupLabel="UPLOAD ACTUAL APP SCREENSHOT HERE (Replace public/mockups/asset_manager.png)"
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
