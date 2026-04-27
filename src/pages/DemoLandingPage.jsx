import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Layers, Cpu, Eye, Smartphone, ArrowRight, Play, Globe, Maximize, MessageSquare } from 'lucide-react';

export default function DemoLandingPage() {
  return (
    <div style={{
      fontFamily: '"Inter", "Outfit", sans-serif',
      background: '#050505',
      color: '#ffffff',
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', background: 'rgba(5, 5, 5, 0.8)',
        backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Box color="#3b82f6" size={28} />
          <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>3DS INTERACTIVE</span>
        </div>
        <Link to="/" style={{
          background: '#3b82f6', color: 'white', textDecoration: 'none',
          padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold',
          display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
        }} className="hover-lift">
          Launch Viewer <Play size={16} />
        </Link>
      </nav>

      {/* Hero Section */}
      <section style={{
        position: 'relative', paddingTop: '160px', paddingBottom: '100px',
        textAlign: 'center', px: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        {/* Abstract Background Glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 0, pointerEvents: 'none'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-block', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)',
            color: '#60a5fa', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600',
            marginBottom: '24px'
          }}>
            Next-Generation Architectural Visualization
          </div>
          <h1 style={{ fontSize: '64px', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1px' }}>
            Immersive Real Estate <br/>
            <span style={{ color: '#3b82f6' }}>Sales Experiences.</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#a1a1aa', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.6' }}>
            Elevate your property presentations with interactive WebGL 3D models, photorealistic spatial tours, and AI-driven virtual concierges—all inside the browser. No app required.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/" style={{
              background: '#ffffff', color: '#000000', textDecoration: 'none',
              padding: '16px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'
            }} className="hover-lift">
              Try Interactive Demo <ArrowRight size={20} />
            </Link>
          </div>
        </div>
        
        {/* Mockup Image Area */}
        <div style={{
          marginTop: '80px', width: '90%', maxWidth: '1200px', height: '600px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '24px', position: 'relative', zIndex: 1, overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* We can use a generic abstract pattern or a placeholder since we don't have a static image */}
          <div style={{ textAlign: 'center', opacity: 0.5 }}>
            <Box size={64} style={{ marginBottom: '16px', color: 'var(--text-secondary)' }} />
            <h3>Interactive WebGL Canvas</h3>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '100px 40px', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h2 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '16px' }}>Powerful Features</h2>
            <p style={{ fontSize: '18px', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>
              Everything you need to close off-plan sales faster and provide an unforgettable client experience.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <FeatureCard 
              icon={<Globe color="#3b82f6" size={32} />}
              title="Real-Time 3D WebGL"
              desc="Fluid, interactive 3D models running natively in any web browser. Clients can orbit, zoom, and explore every detail of your architecture instantly."
            />
            <FeatureCard 
              icon={<MessageSquare color="#10b981" size={32} />}
              title="Emma AI Concierge"
              desc="An integrated virtual assistant trained on your project data. Emma can answer questions about pricing, availability, and materials 24/7."
            />
            <FeatureCard 
              icon={<Eye color="#f59e0b" size={32} />}
              title="360° Spatial Tours"
              desc="High-fidelity panoramic hotspots that let buyers step inside the property and experience photorealistic lighting and textures."
            />
            <FeatureCard 
              icon={<Layers color="#8b5cf6" size={32} />}
              title="Live Availability Grid"
              desc="Connect directly to your CRM to show real-time unit statuses, pricing, and floorplans so buyers have all the data they need."
            />
            <FeatureCard 
              icon={<Smartphone color="#ec4899" size={32} />}
              title="WebAR Ready"
              desc="Bring architecture into the real world. Clients can project 3D models onto their living room table using Augmented Reality on iOS and Android."
            />
            <FeatureCard 
              icon={<Maximize color="#ef4444" size={32} />}
              title="Cinematic Mode"
              desc="Immerse buyers with full-screen fly-through videos, image galleries, and a distraction-free presentation environment."
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ padding: '120px 40px', textAlign: 'center', background: '#050505' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px' }}>Ready to transform your sales?</h2>
          <p style={{ fontSize: '20px', color: '#a1a1aa', marginBottom: '40px' }}>
            Experience the future of property presentation firsthand. Explore the demo application now.
          </p>
          <Link to="/" style={{
            background: '#3b82f6', color: 'white', textDecoration: 'none',
            padding: '20px 48px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold',
            display: 'inline-flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s'
          }} className="hover-lift">
            Enter the Viewer <Play fill="white" size={20} />
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ padding: '40px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#52525b' }}>
        <p>© {new Date().getFullYear()} 3DS Interactive. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
      padding: '40px', borderRadius: '24px', transition: 'all 0.3s'
    }} className="hover-lift">
      <div style={{ 
        width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>{title}</h3>
      <p style={{ color: '#a1a1aa', fontSize: '16px', lineHeight: '1.6' }}>{desc}</p>
    </div>
  );
}
