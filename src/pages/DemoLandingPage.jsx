import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Layers, Cpu, Eye, Smartphone, ArrowRight, Play, Globe, Maximize, MessageSquare, CheckCircle, XCircle, Database, Zap, LayoutDashboard, Fingerprint } from 'lucide-react';

// Intersection Observer Hook for Scroll Animations
function useOnScreen(ref, rootMargin = '0px') {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIntersecting(true);
      },
      { rootMargin, threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return isIntersecting;
}

const FadeInSection = ({ children, delay = 0, direction = 'up' }) => {
  const ref = useRef();
  const isVisible = useOnScreen(ref);
  
  let transform = 'translateY(40px)';
  if (direction === 'left') transform = 'translateX(-40px)';
  if (direction === 'right') transform = 'translateX(40px)';
  if (direction === 'none') transform = 'none';

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? (direction === 'none' ? 'scale(1)' : 'translate(0)') : transform,
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        width: '100%'
      }}
    >
      {children}
    </div>
  );
};

export default function DemoLandingPage() {
  // Global CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
        100% { transform: translateY(0px); }
      }
      @keyframes pulse-glow {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
        70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
      .gradient-text {
        background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .blue-gradient-text {
        background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .glass-card {
        background: rgba(255, 255, 255, 0.02);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      }
      .deck-section {
        min-height: 100vh;
        display: flex;
        align-items: center;
        padding: 100px 40px;
        position: relative;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{
      fontFamily: '"Inter", "Outfit", sans-serif',
      background: '#030508',
      color: '#ffffff',
      overflowX: 'hidden'
    }}>
      {/* Dynamic Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', background: 'rgba(3, 5, 8, 0.8)',
        backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '6px', borderRadius: '8px' }}>
            <Box color="white" size={24} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '1px' }}>3DS INTERACTIVE</span>
        </div>
        <Link to="/" style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', textDecoration: 'none',
          padding: '12px 28px', borderRadius: '50px', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
        }} className="hover-lift">
          Launch Live Viewer <Play fill="white" size={16} />
        </Link>
      </nav>

      {/* Slide 1: HERO */}
      <section className="deck-section" style={{ justifyContent: 'center', textAlign: 'center', paddingTop: '160px' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '80vw', height: '80vw', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(3,5,8,0) 60%)',
          zIndex: 0, pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', width: '100%' }}>
          <FadeInSection>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.1)', 
              border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa', padding: '8px 20px', 
              borderRadius: '50px', fontSize: '14px', fontWeight: 'bold', marginBottom: '32px',
              textTransform: 'uppercase', letterSpacing: '1px'
            }}>
              <Zap size={16} /> The Future of PropTech is Here
            </div>
          </FadeInSection>
          
          <FadeInSection delay={0.2}>
            <h1 style={{ fontSize: 'clamp(48px, 6vw, 96px)', fontWeight: '900', lineHeight: '1.05', marginBottom: '32px', letterSpacing: '-2px' }}>
              Sell the Unbuilt.<br/>
              <span className="blue-gradient-text">Experience the Impossible.</span>
            </h1>
          </FadeInSection>
          
          <FadeInSection delay={0.4}>
            <p style={{ fontSize: 'clamp(18px, 2vw, 24px)', color: '#a1a1aa', maxWidth: '800px', margin: '0 auto 48px', lineHeight: '1.6' }}>
              Transform static renderings into highly interactive, web-based sales experiences. 
              Combine 3D WebGL, AI, and Live CRM data into one seamless platform. No apps required.
            </p>
          </FadeInSection>
          
          <FadeInSection delay={0.6}>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/" style={{
                background: '#ffffff', color: '#000000', textDecoration: 'none',
                padding: '20px 40px', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s'
              }} className="hover-lift">
                Enter the Demo <ArrowRight size={20} />
              </Link>
              <a href="#problem" style={{
                background: 'rgba(255,255,255,0.05)', color: '#ffffff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)',
                padding: '20px 40px', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s'
              }} className="hover-lift">
                Explore Features
              </a>
            </div>
          </FadeInSection>
        </div>

        {/* Floating Decorative Elements */}
        <Box size={120} color="rgba(59,130,246,0.1)" style={{ position: 'absolute', top: '20%', left: '10%', animation: 'float 6s ease-in-out infinite' }} />
        <Globe size={180} color="rgba(255,255,255,0.02)" style={{ position: 'absolute', bottom: '10%', right: '5%', animation: 'float 8s ease-in-out infinite reverse' }} />
      </section>

      {/* Slide 2: THE PROBLEM */}
      <section id="problem" className="deck-section" style={{ background: '#080b12' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexWrap: 'wrap', gap: '64px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 500px' }}>
            <FadeInSection direction="left">
              <h2 className="gradient-text" style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px', lineHeight: '1.2' }}>
                Static PDFs don't sell million-dollar properties.
              </h2>
              <p style={{ fontSize: '20px', color: '#a1a1aa', marginBottom: '32px', lineHeight: '1.6' }}>
                Buyers are tired of imagining what a space looks like from 2D floorplans and a handful of curated renders. They want to explore. They want to feel the space.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#ef4444' }}>
                  <XCircle size={24} /> <span style={{ fontSize: '18px', color: '#a1a1aa' }}>Static brochures get ignored</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#ef4444' }}>
                  <XCircle size={24} /> <span style={{ fontSize: '18px', color: '#a1a1aa' }}>VR headsets are too much friction</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#ef4444' }}>
                  <XCircle size={24} /> <span style={{ fontSize: '18px', color: '#a1a1aa' }}>Outdated PDF inventory lists kill deals</span>
                </div>
              </div>
            </FadeInSection>
          </div>
          
          <div style={{ flex: '1 1 500px' }}>
            <FadeInSection direction="right" delay={0.2}>
              <div className="glass-card" style={{ padding: '40px', borderRadius: '32px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', background: '#3b82f6', padding: '16px', borderRadius: '50%', animation: 'pulse-glow 2s infinite' }}>
                  <CheckCircle color="white" size={32} />
                </div>
                <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px', color: '#ffffff' }}>The Interactive Solution</h3>
                <p style={{ fontSize: '18px', color: '#a1a1aa', marginBottom: '32px', lineHeight: '1.6' }}>
                  Deliver a fully immersive, 3D experience directly via a web link. No downloads. No apps. Instantly accessible on desktop and mobile.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ background: 'rgba(59,130,246,0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div style={{ fontSize: '36px', fontWeight: '900', color: '#60a5fa', marginBottom: '8px' }}>3x</div>
                    <div style={{ fontSize: '14px', color: '#a1a1aa' }}>Higher Engagement</div>
                  </div>
                  <div style={{ background: 'rgba(59,130,246,0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div style={{ fontSize: '36px', fontWeight: '900', color: '#60a5fa', marginBottom: '8px' }}>40%</div>
                    <div style={{ fontSize: '14px', color: '#a1a1aa' }}>Faster Sales Cycle</div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Slide 3: CORE TECH / WEBGL */}
      <section className="deck-section" style={{ background: '#030508' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <FadeInSection>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <Cpu size={48} color="#3b82f6" style={{ marginBottom: '24px' }} />
              <h2 style={{ fontSize: '56px', fontWeight: '900', marginBottom: '24px', letterSpacing: '-1px' }}>Native Browser <span className="blue-gradient-text">WebGL</span></h2>
              <p style={{ fontSize: '22px', color: '#a1a1aa', maxWidth: '700px', margin: '0 auto' }}>
                We stream highly optimized FBX and GLB architectural models directly into the browser at 60 frames per second.
              </p>
            </div>
          </FadeInSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', width: '100%' }}>
            <FadeInSection delay={0.1}>
              <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', height: '100%' }}>
                <Box size={32} color="#60a5fa" style={{ marginBottom: '24px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>First-Person Walkthroughs</h3>
                <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>Allow clients to walk through the unbuilt architecture just like a video game using intuitive keyboard/touch controls.</p>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.3}>
              <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', height: '100%' }}>
                <Eye size={32} color="#60a5fa" style={{ marginBottom: '24px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Dynamic Material Swaps</h3>
                <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>Clients can customize their future home in real-time, swapping marble countertops for wood, or changing cabinet colors instantly.</p>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.5}>
              <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', height: '100%' }}>
                <Globe size={32} color="#60a5fa" style={{ marginBottom: '24px' }} />
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Photorealistic Lighting</h3>
                <p style={{ color: '#a1a1aa', lineHeight: '1.6' }}>PBR rendering, soft shadows, and dynamic Time-of-Day controls (Morning, Noon, Night) create breathtaking realism.</p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Slide 4: AI & CRM */}
      <section className="deck-section" style={{ background: '#080b12' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexWrap: 'wrap-reverse', gap: '64px', alignItems: 'center' }}>
          
          <div style={{ flex: '1 1 500px', display: 'grid', gap: '24px' }}>
            <FadeInSection direction="left" delay={0.1}>
              <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '50%' }}>
                  <MessageSquare size={32} color="#10b981" />
                </div>
                <div>
                  <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Emma AI (Gemini Vision)</h4>
                  <p style={{ color: '#a1a1aa' }}>An intelligent agent that understands the 3D scene and answers complex buyer questions autonomously.</p>
                </div>
              </div>
            </FadeInSection>
            
            <FadeInSection direction="left" delay={0.3}>
              <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '20px', borderRadius: '50%' }}>
                  <Database size={32} color="#8b5cf6" />
                </div>
                <div>
                  <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Live Inventory CRM</h4>
                  <p style={{ color: '#a1a1aa' }}>Connects to Supabase to pull live unit statuses (Available, Reserved, Sold) directly onto the 3D floorplans.</p>
                </div>
              </div>
            </FadeInSection>
          </div>

          <div style={{ flex: '1 1 500px' }}>
            <FadeInSection direction="right">
              <h2 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px', lineHeight: '1.2' }}>
                More than just visuals. <br/>
                <span className="gradient-text">It's a data machine.</span>
              </h2>
              <p style={{ fontSize: '20px', color: '#a1a1aa', marginBottom: '40px', lineHeight: '1.6' }}>
                The 3D Viewer acts as the ultimate sales portal. It doesn't just show the building; it actively sells it by connecting the visual asset directly to your business logic and CRM data.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px' }}><CheckCircle color="#3b82f6" /> Capture leads directly inside the 3D viewer</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px' }}><CheckCircle color="#3b82f6" /> Avoid selling the same unit twice with live sync</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px' }}><CheckCircle color="#3b82f6" /> AI handles late-night inquiries globally</li>
              </ul>
            </FadeInSection>
          </div>
          
        </div>
      </section>

      {/* Slide 5: ASSET MANAGER CMS */}
      <section className="deck-section" style={{ background: '#030508' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
          <FadeInSection>
            <LayoutDashboard size={48} color="#3b82f6" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: '56px', fontWeight: '900', marginBottom: '24px', letterSpacing: '-1px' }}>
              You are in <span className="blue-gradient-text">Control.</span>
            </h2>
            <p style={{ fontSize: '22px', color: '#a1a1aa', maxWidth: '800px', margin: '0 auto 64px' }}>
              The standalone viewer comes with a built-in Asset Manager CMS. Drag-and-drop folders, upload massive FBX models, and reorder cinematic videos without writing a line of code.
            </p>
          </FadeInSection>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'left' }}>
            <FadeInSection delay={0.2} direction="up">
              <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', borderTop: '4px solid #3b82f6' }}>
                <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Bulk Folder Uploads</h4>
                <p style={{ color: '#a1a1aa' }}>Upload entire folders containing your OBJ/FBX models alongside all their PBR textures directly into the cloud.</p>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.4} direction="up">
              <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', borderTop: '4px solid #8b5cf6' }}>
                <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Theme Customization</h4>
                <p style={{ color: '#a1a1aa' }}>Switch between Light and Dark modes globally, and inject your company's accent color into the entire UI instantly.</p>
              </div>
            </FadeInSection>
            <FadeInSection delay={0.6} direction="up">
              <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', borderTop: '4px solid #10b981' }}>
                <h4 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Hotspot Editor</h4>
                <p style={{ color: '#a1a1aa' }}>Visually place information hotspots inside your 360° panoramas or 3D models to highlight key features.</p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* Slide 6: CTA */}
      <section className="deck-section" style={{ background: 'linear-gradient(180deg, #030508 0%, #0d1b2a 100%)', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <FadeInSection>
            <Fingerprint size={64} color="#60a5fa" style={{ margin: '0 auto 32px' }} />
            <h2 style={{ fontSize: '64px', fontWeight: '900', marginBottom: '24px', letterSpacing: '-1px' }}>
              Stop Pitching.<br/>Start <span className="blue-gradient-text">Immersing.</span>
            </h2>
            <p style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '48px', lineHeight: '1.6' }}>
              Don't take our word for it. Step inside the application and experience the future of real estate sales yourself.
            </p>
            
            <Link to="/" style={{
              background: '#3b82f6', color: '#ffffff', textDecoration: 'none', boxShadow: '0 10px 30px rgba(59,130,246,0.5)',
              padding: '24px 64px', borderRadius: '50px', fontSize: '24px', fontWeight: 'bold',
              display: 'inline-flex', alignItems: 'center', gap: '16px', transition: 'all 0.3s',
              transform: 'scale(1)', 
            }} 
            className="hover-lift"
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Launch Live Presentation <Play fill="white" size={24} />
            </Link>
          </FadeInSection>
        </div>
      </section>

    </div>
  );
}
