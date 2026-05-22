import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Image as ImageIcon, Layers, LayoutGrid, MessageSquare, Smartphone, ArrowRight, Map, Video, Settings, ChevronUp, Sparkles, Send, Cpu, ShieldCheck, Globe, Zap, MousePointer } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- Fashionable 3D Liquid Crystal Fluid Shader ---
const FluidShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColor1: { value: new THREE.Color('#3b82f6') }, // Accent bright blue
    uColor2: { value: new THREE.Color('#8b5cf6') }, // Elegant purple
    uColor3: { value: new THREE.Color('#0f172a') }  // Deep space obsidian slate
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform float uTime;
    uniform vec2 uMouse;

    // Simplex Noise algorithm for displacement
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);

      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;

      i = mod289(i);
      vec4 p = permute(permute(permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));

      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z);

      vec4 x = floor(j * ns.z);
      vec4 y = floor(j - 7.0 * x);

      vec4 x_ = x * ns.x + ns.yyyy;
      vec4 y_ = y * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x_) - abs(y_);

      vec4 b0 = vec4(x_.xy, y_.xy);
      vec4 b1 = vec4(x_.zw, y_.zw);

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1),
                                    dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // Shift positions based on mouse coordinates + simplex noise wave
      vec3 pos = position;
      float noise = snoise(vec3(pos.x * 0.8 + uTime * 0.1, pos.y * 0.8 - uTime * 0.08, dot(uMouse, vec2(0.25))));
      pos.z += noise * 0.45;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Calculate high-fidelity Fresnel rim glow
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.5);

      // Map liquid colors based on UV texture space coordinates and time coordinates
      float wave = sin(vUv.x * 5.0 + uTime * 0.35 + uMouse.x * 1.5) * 0.5 + 0.5;
      float wave2 = cos(vUv.y * 4.0 - uTime * 0.25 + uMouse.y * 1.5) * 0.5 + 0.5;
      
      vec3 finalBase = mix(uColor1, uColor2, wave);
      finalBase = mix(finalBase, uColor3, wave2 * 0.8);
      
      // Pearlescent silver highlight reflections
      vec3 reflection = reflect(-viewDir, normal);
      float specular = pow(max(dot(reflection, vec3(0.0, 1.0, 0.0)), 0.0), 24.0);
      
      vec3 col = finalBase + (fresnel * 0.55) + (specular * 0.3);
      
      // Vignette effect for elegant overlay fadeout edges
      float d = distance(vUv, vec2(0.5));
      float vig = smoothstep(0.9, 0.15, d);
      
      gl_FragColor = vec4(col, 0.26 * vig);
    }
  `
};

const FluidShaderMesh = () => {
  const meshRef = useRef();
  const materialRef = useRef();
  
  const mouse = useRef(new THREE.Vector2(0, 0));
  const targetMouse = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handleMouseMove = (e) => {
      targetMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      mouse.current.lerp(targetMouse.current, 0.05);
      materialRef.current.uniforms.uMouse.value.copy(mouse.current);
    }
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(time * 0.03) * 0.04;
      meshRef.current.rotation.y = time * 0.015;
    }
  });

  const uniforms = useMemo(() => THREE.UniformsUtils.clone(FluidShader.uniforms), []);

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <planeGeometry args={[20, 14, 96, 96]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={FluidShader.vertexShader}
        fragmentShader={FluidShader.fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

export function HeroShaderBackground() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 50%, #030712 0%, #020617 100%)' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <FluidShaderMesh />
      </Canvas>
    </div>
  );
}

// --- Interactive Emma AI Sales Agent Component ---
function BentoAIChat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Emma', text: "Hi there! I am Emma, your interactive 3D concierge. Would you like to check our property options?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const OPTIONS = [
    { label: "Show Penthouse Details", reply: "I'd love to see the Penthouse floorplan and pricing!" },
    { label: "Is it mobile-friendly?", reply: "Does this interactive model run natively on mobile?" },
    { label: "Book a Virtual Tour", reply: "Can we schedule a live 3D guided walkthrough?" }
  ];

  const handleOptionClick = (option) => {
    // Add user message
    const userMsg = { id: Date.now(), sender: 'User', text: option.reply };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate Emma typing reply
    setTimeout(() => {
      let emmaReply = "";
      if (option.label.includes("Penthouse")) {
        emmaReply = "The Serenity Penthouse features 4 bedrooms, panoramic ocean views, private pool deck, and is listed at $2.4M USD. The live inventory tab in this dashboard shows it is currently available!";
      } else if (option.label.includes("mobile")) {
        emmaReply = "Absolutely! It features responsive WebGL graphics and allows clients to seamlessly project augmented reality (AR) views on iOS and Android devices without installing any apps.";
      } else {
        emmaReply = "Perfect choice. I've sent a priority schedule invite to your email for a personalized virtual presentation with our lead spatial engineer tomorrow.";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'Emma', text: emmaReply }]);
      setIsTyping(false);
    }, 1200);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', fontFamily: 'Outfit, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(6, 182, 212, 0.35)' }}>
          <MessageSquare size={20} color="white" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '15px', fontWeight: '800', color: 'white' }}>Emma — AI Spatial Concierge</span>
          <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block' }} /> Live Assistant
          </span>
        </div>
      </div>

      {/* Chat Thread */}
      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '240px' }} className="chat-scrollbar">
        {messages.map(msg => (
          <div 
            key={msg.id}
            style={{
              alignSelf: msg.sender === 'Emma' ? 'flex-start' : 'flex-end',
              background: msg.sender === 'Emma' ? 'rgba(255, 255, 255, 0.06)' : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              border: msg.sender === 'Emma' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
              padding: '12px 16px',
              borderRadius: msg.sender === 'Emma' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
              maxWidth: '85%',
              boxShadow: msg.sender === 'Emma' ? 'none' : '0 6px 18px rgba(59, 130, 246, 0.25)',
              transformOrigin: msg.sender === 'Emma' ? 'left bottom' : 'right bottom',
              animation: 'chatEntrance 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
            }}
          >
            <p style={{ margin: 0, fontSize: '13.5px', color: 'white', lineHeight: '1.45', fontWeight: '500' }}>{msg.text}</p>
          </div>
        ))}

        {isTyping && (
          <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px 18px', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', animation: 'pulse 1s infinite alternate' }} />
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', animation: 'pulse 1s infinite alternate 0.2s' }} />
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', animation: 'pulse 1s infinite alternate 0.4s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Response Prompts */}
      <div style={{ padding: '0 20px 16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', letterSpacing: '0.5px' }}>ASK EMMA A QUESTION:</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {OPTIONS.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionClick(opt)}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                color: '#60a5fa',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.borderColor = '#60a5fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.25)';
              }}
            >
              {opt.label}
              <ArrowRight size={12} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Main Premium Landing Page ---
export default function DemoLandingPage() {
  const scrollContainerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  const handleScroll = (e) => {
    setShowScrollTop(e.target.scrollTop > 500);
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
        background: '#020617',
        color: '#f8fafc',
        height: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      <style>{`
        /* custom micro transitions */
        .glass-nav {
          background: rgba(10, 12, 18, 0.35);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
        }

        .cta-btn-main {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 8px 24px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.4);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cta-btn-main:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 16px 40px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.4);
          background: var(--accent-color, #3b82f6);
          color: #ffffff;
        }

        .bento-card-premium {
          background: rgba(16, 18, 26, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(40px) saturate(220%);
          -webkit-backdrop-filter: blur(40px) saturate(220%);
          border-radius: 28px;
          padding: 36px;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          box-shadow: 0 16px 36px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
        }

        .bento-card-premium:hover {
          border-color: rgba(255,255,255,0.25);
          background: rgba(20, 24, 36, 0.55);
          transform: translateY(-8px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.25);
        }

        .bento-img-premium {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          z-index: 0;
          opacity: 0.42;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
        }

        .bento-card-premium:hover .bento-img-premium {
          opacity: 0.85;
          transform: scale(1.04);
        }

        .bento-overlay-premium {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(0deg, rgba(2,6,23,0.95) 0%, rgba(2,6,23,0.3) 100%);
          z-index: 1;
        }

        .bento-card-content {
          position: relative;
          z-index: 2;
        }

        .feature-pill-animated {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .feature-pill-animated:hover {
          background: rgba(255, 255, 255, 0.12) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
          transform: scale(1.05);
        }

        @keyframes chatEntrance {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .chat-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        @keyframes pulse {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }

        @media (max-width: 1100px) {
          .bento-card-premium {
             grid-column: span 12 !important;
          }
        }

        @media (max-width: 768px) {
          .hero-main-title { font-size: 54px !important; line-height: 1.1 !important; letter-spacing: -2px !important; }
          .hero-desc { font-size: 17px !important; margin-bottom: 24px !important; }
          .bento-card-premium { padding: 24px !important; min-height: 380px !important; }
          .everything-headline { font-size: 38px !important; margin-bottom: 40px !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, #00c6ff, #0072ff)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0, 198, 255, 0.4)' }}>
            <Box color="#ffffff" size={20} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '2.5px', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Outfit, sans-serif' }}>PROTECH</span>
        </div>
        <div>
          <Link to="/" className="cta-btn-main" style={{ textDecoration: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            View Live App <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center', overflow: 'hidden' }}>
        {/* State of the art liquid shader background */}
        <HeroShaderBackground />

        {/* Diagonal lighting gradient */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, transparent 20%, #020617 95%)', zIndex: 1, pointerEvents: 'none' }} />

        {/* Ambient top glowing bar */}
        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.5), transparent)', filter: 'blur(4px)', zIndex: 2 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', transform: 'translateY(12px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '50px', padding: '6px 18px', color: '#38bdf8', fontWeight: '700', fontSize: '12.5px', marginBottom: '24px', background: 'rgba(56, 189, 248, 0.06)', backdropFilter: 'blur(10px)', letterSpacing: '0.5px' }}>
            <Sparkles size={14} /> THE FUTURE OF ARCHITECTURAL SALES
          </div>
          
          <h1 className="hero-main-title" style={{ fontSize: '84px', fontWeight: '900', lineHeight: 1.02, letterSpacing: '-3.5px', marginBottom: '24px' }}>
            Immersive <br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Architecture.</span>
          </h1>

          <p className="hero-desc" style={{ fontSize: '20px', color: '#94a3b8', maxWidth: '640px', margin: '0 auto 36px', lineHeight: '1.6', fontWeight: '500' }}>
            Ditch static PDFs and generic walkthrough videos. Deploy gorgeous, fully-scale interactive 3D WebGL presentations right inside your client's web browser.
          </p>

          {/* Interactive Feature Grid Pills */}
          <div className="hero-feature-pills" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', maxWidth: '780px', margin: '0 auto' }}>
            {[
              { label: 'Natively Embedded AR', icon: <Smartphone size={15} color="#eab308" /> },
              { label: '3D WebGL Engine', icon: <Box size={15} color="#3b82f6" /> },
              { label: 'Cinematic Galleries', icon: <ImageIcon size={15} color="#10b981" /> },
              { label: 'Multi-Level Floorplans', icon: <Layers size={15} color="#8b5cf6" /> },
              { label: '360° Panorama Tours', icon: <Map size={15} color="#f59e0b" /> },
              { label: 'CRM Live Inventory', icon: <LayoutGrid size={15} color="#ec4899" /> },
              { label: 'Cinematics Hub', icon: <Video size={15} color="#14b8a6" /> },
              { label: 'AI Concierge', icon: <MessageSquare size={15} color="#06b6d4" /> },
              { label: 'Admin Asset Manager', icon: <Settings size={15} color="#f97316" /> }
            ].map((feat, i) => (
              <span 
                className="hero-feature-pill feature-pill-animated" 
                key={feat.label}
                onMouseEnter={() => setActiveFeature(i)}
                onMouseLeave={() => setActiveFeature(null)}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: activeFeature === i ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', 
                  border: activeFeature === i ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.06)', 
                  padding: '8px 18px', 
                  borderRadius: '50px', 
                  fontSize: '13.5px', 
                  color: '#f1f5f9', 
                  backdropFilter: 'blur(16px)',
                  fontWeight: '600',
                  boxShadow: activeFeature === i ? '0 8px 20px rgba(0,0,0,0.3)' : 'none'
                }}
              >
                {feat.icon} {feat.label}
              </span>
            ))}
          </div>
        </div>

        {/* Ambient bottom gradient shade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(0deg, #020617 0%, transparent 100%)', zIndex: 2 }} />
      </section>

      {/* BENTO GRID */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 40px 100px 40px', position: 'relative', zIndex: 3 }}>
        <h2 className="everything-headline" style={{ fontSize: '52px', fontWeight: '900', marginBottom: '64px', textAlign: 'center', letterSpacing: '-2px' }}>
          Everything you need. <br />
          <span style={{ fontSize: '18px', fontWeight: '500', color: 'rgba(255,255,255,0.55)', letterSpacing: '0px' }}>Explore the premium architectural presentation toolset</span>
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', gridAutoRows: 'minmax(420px, auto)' }}>
          
          {/* Main AR Card (Span 8) */}
          <div className="bento-card-premium" style={{ gridColumn: 'span 8', minHeight: '440px' }}>
            <img src="/mockups/ar_technology.png" className="bento-img-premium" alt="Augmented Reality View" style={{ objectPosition: 'center 32%' }} />
            <div className="bento-overlay-premium" />
            <div className="bento-card-content" style={{ maxWidth: '520px' }}>
              <Smartphone size={32} color="#eab308" style={{ marginBottom: '18px' }} />
              <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.5px' }}>Augmented Reality Natively</h3>
              <p style={{ color: '#94a3b8', fontSize: '16.5px', lineHeight: '1.6', fontWeight: '500' }}>Project massive 3D models at true spatial scale straight onto your client's desk using native device capabilities. Zero application installations required.</p>
            </div>
          </div>

          {/* Render Gallery (Span 4) */}
          <div className="bento-card-premium" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/render_gallery.png" className="bento-img-premium" alt="Photorealistic Renders" />
            <div className="bento-overlay-premium" />
            <div className="bento-card-content">
              <ImageIcon size={32} color="#10b981" style={{ marginBottom: '18px' }} />
              <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.5px' }}>Cinematic Gallery</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', fontWeight: '500' }}>Organize photorealistic renders and high-fidelity project visual assets in an elegant, curated multi-aspect showcase grid.</p>
            </div>
          </div>

          {/* HIGH-FIDELITY 3D WEBGL VIEWER (Span 12) */}
          <div className="bento-card-premium" style={{ gridColumn: 'span 12', height: '620px', padding: 0 }}>
             <img src="/mockups/3d_viewer.png" className="bento-img-premium" alt="3D WebGL Realtime Engine Mockup" style={{ objectPosition: 'center 45%', opacity: 0.65 }} />
             
             {/* Dynamic side vignetted background gradient overlay */}
             <div className="bento-overlay-premium" style={{ background: 'linear-gradient(90deg, #020617 0%, rgba(2,6,23,0.85) 45%, rgba(2,6,23,0.1) 100%)' }} />
             
             {/* Left floating descriptive panels */}
             <div className="bento-card-content" style={{ maxWidth: '580px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 60px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '50px', padding: '6px 14px', color: '#60a5fa', fontWeight: '700', fontSize: '11px', marginBottom: '24px', background: 'rgba(59, 130, 246, 0.1)', alignSelf: 'flex-start', letterSpacing: '0.5px' }}>
                  <Cpu size={12} /> PROMOTIONAL SHOWCASE
                </div>
                
                <h3 style={{ fontSize: '56px', fontWeight: '900', lineHeight: '1.05', marginBottom: '20px', letterSpacing: '-2px' }}>
                  Unmatched <br/>
                  WebGL Power.
                </h3>
                
                <p style={{ color: '#94a3b8', fontSize: '18px', lineHeight: '1.6', fontWeight: '500', marginBottom: '32px' }}>
                  Allow clients to freely orbit, walk through, and explore high-poly architectural assets in real-time right inside their browser at a buttery smooth 60 FPS. Includes ambient shadow casting, specular reflections, and smart material configuration.
                </p>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#f8fafc', fontWeight: 'bold' }}>
                    <ShieldCheck size={14} color="#10b981" /> WebGL 2.0 Engine
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#f8fafc', fontWeight: 'bold' }}>
                    <Zap size={14} color="#eab308" /> Butter Smooth 60fps
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#f8fafc', fontWeight: 'bold' }}>
                    <Globe size={14} color="#06b6d4" /> zero-Plugin Embeds
                  </div>
                </div>
             </div>
          </div>

          {/* AI Sales Concierge (Span 4) */}
          <div className="bento-card-premium" style={{ gridColumn: 'span 4', padding: 0, display: 'flex', flexDirection: 'column', height: '460px' }}>
            <BentoAIChat />
          </div>

          {/* Live Inventory (Span 4) */}
          <div className="bento-card-premium" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/availability_grid.png" className="bento-img-premium" alt="CRM Availability Matrix" />
            <div className="bento-overlay-premium" />
            <div className="bento-card-content">
              <LayoutGrid size={32} color="#ec4899" style={{ marginBottom: '18px' }} />
              <h3 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.5px' }}>Live Inventory</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', fontWeight: '500' }}>Real-time synchronization with client CRM databases. Track penthouse, unit availability, and pricing in a single tap.</p>
            </div>
          </div>

          {/* Smart Floorplans (Span 4) */}
          <div className="bento-card-premium" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/floorplan.png" className="bento-img-premium" alt="Vector Floorplan Navigation" />
            <div className="bento-overlay-premium" />
            <div className="bento-card-content">
              <Layers size={32} color="#8b5cf6" style={{ marginBottom: '18px' }} />
              <h3 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.5px' }}>Smart Floorplans</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', fontWeight: '500' }}>Multi-level vector floorplan navigation. Sync coordinate hotspots to actual 3D locations natively.</p>
            </div>
          </div>

          {/* 360 Tours (Span 4) */}
          <div className="bento-card-premium" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/spatial_tour.png" className="bento-img-premium" alt="360 Spherical Panoramas" />
            <div className="bento-overlay-premium" />
            <div className="bento-card-content">
              <Map size={32} color="#f59e0b" style={{ marginBottom: '18px' }} />
              <h3 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.5px' }}>360° Tours</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', fontWeight: '500' }}>Photorealistic spherical virtual tours. Walk through completed villas and spatial environments seamlessly.</p>
            </div>
          </div>

          {/* Cinematic Video (Span 4) */}
          <div className="bento-card-premium" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/video_hub.png" className="bento-img-premium" alt="Cinematic presentation movies" />
            <div className="bento-overlay-premium" />
            <div className="bento-card-content">
              <Video size={32} color="#14b8a6" style={{ marginBottom: '18px' }} />
              <h3 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.5px' }}>Cinematics Hub</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', fontWeight: '500' }}>Distraction-free theater screen module showing architectural movies and promotional cinematography.</p>
            </div>
          </div>

          {/* CMS Asset Manager (Span 4) */}
          <div className="bento-card-premium" style={{ gridColumn: 'span 4' }}>
            <img src="/mockups/asset_manager.png" className="bento-img-premium" alt="Admin CMS manager view" />
            <div className="bento-overlay-premium" />
            <div className="bento-card-content">
              <Settings size={32} color="#f97316" style={{ marginBottom: '18px' }} />
              <h3 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '12px', letterSpacing: '-0.5px' }}>CMS Admin Panel</h3>
              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', fontWeight: '500' }}>Comprehensive cloud database asset management. Control layers, renders, availability status, and parameters instantly.</p>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '60px 20px', textAlign: 'center', background: '#020617', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 3 }}>
        <p style={{ color: '#64748b', fontSize: '13.5px', fontFamily: 'Outfit, sans-serif' }}>
          Designed and developed by <a href="https://progressivetechnologies.com.cy" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold', borderBottom: '1px solid transparent', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.borderColor = '#38bdf8'} onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}>Progressive Technologies</a>
        </p>
      </footer>

      {/* BACK TO TOP BUTTON */}
      <button 
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '36px',
          right: '36px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
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
          boxShadow: '0 12px 32px rgba(0,198,255,0.3)',
          zIndex: 1000
        }}
        aria-label="Scroll to top"
      >
        <ChevronUp size={24} />
      </button>

    </div>
  );
}
