import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, Image as ImageIcon, Layers, LayoutGrid, MessageSquare, Smartphone, ArrowRight, 
  Map, Video, Settings, ChevronUp, Sparkles, Send, Cpu, ShieldCheck, Globe, Zap, 
  MousePointer, HelpCircle, Activity, Play, Pause, Sliders, RefreshCw, Layers3, Check, DollarSign
} from 'lucide-react';
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

// --- Interactive Emma AI Sales Agent Component V2 ---
function BentoAIChat() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Emma', text: "Welcome! I am Emma, your spatial concierge. Type a question below or choose a suggestion to explore!" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const OPTIONS = [
    { label: "Show Pricing Details", reply: "What are the licensing costs and rendering fees?" },
    { label: "Is it mobile-friendly?", reply: "Does this interactive model run natively on mobile browsers?" },
    { label: "Can I book a live tour?", reply: "How can we schedule a live virtual tour with an engineer?" }
  ];

  const triggerAIResponse = (userQuery) => {
    setIsTyping(true);
    setTimeout(() => {
      let reply = "";
      const query = userQuery.toLowerCase();

      if (query.includes("price") || query.includes("cost") || query.includes("licens") || query.includes("fee") || query.includes("pay")) {
        reply = "Our Protech interactive platform starts with a baseline SaaS subscription of $199/month. Advanced rendering suites and tailored CRM integrations are calculated dynamically based on inventory scale. Use the ROI Calculator on this page to test outputs!";
      } else if (query.includes("mobile") || query.includes("phone") || query.includes("ar") || query.includes("augmented") || query.includes("ios") || query.includes("android")) {
        reply = "Yes, absolutely! There is zero app download required. The engine leverages native browser WebGL 2.0 and WebXR. Clients simply tap 'AR View' on their mobile Safari/Chrome to project architectural layers directly into their office.";
      } else if (query.includes("tour") || query.includes("walk") || query.includes("orbit") || query.includes("guided") || query.includes("virtual")) {
        reply = "Protech features standard guided cinematic tours, manual first-person WASD exploration ('Walk Mode'), and smooth camera orbits. I can queue a personalized live spatial walkthrough with our lead design engineer. Would tomorrow at 3:00 PM work?";
      } else if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query.includes("hola")) {
        reply = "Hello! Great to connect with you. I am ready to answer any questions about our real-time interactive architectural presentation deck!";
      } else {
        reply = "That's an excellent question. Protech's spatial rendering platform automatically pulls active CRM inventory, supports dynamic shadow casting, and embeds anywhere. I'd love to loop in our spatial coordinator to review your projects. Type 'book' or leave your email to schedule!";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'Emma', text: reply }]);
      setIsTyping(false);
    }, 1100);
  };

  const handleOptionClick = (option) => {
    const userMsg = { id: Date.now(), sender: 'User', text: option.reply };
    setMessages(prev => [...prev, userMsg]);
    triggerAIResponse(option.reply);
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'User', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    const query = inputText;
    setInputText("");
    
    triggerAIResponse(query);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', fontFamily: 'Outfit, sans-serif' }}>
      {/* Header with pulsating neural visualizer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)' }}>
            <MessageSquare size={18} color="white" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'white' }}>Emma</span>
            <span style={{ fontSize: '10px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Live Spatial AI
            </span>
          </div>
        </div>

        {/* Pulsating Neural Soundwave */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '12px' }}>
          <div className="wave-line" style={{ animationDelay: '0.1s', height: isTyping ? '12px' : '4px' }} />
          <div className="wave-line" style={{ animationDelay: '0.3s', height: isTyping ? '12px' : '6px' }} />
          <div className="wave-line" style={{ animationDelay: '0.5s', height: isTyping ? '12px' : '5px' }} />
          <div className="wave-line" style={{ animationDelay: '0.2s', height: isTyping ? '12px' : '3px' }} />
        </div>
      </div>

      {/* Chat Thread */}
      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '200px' }} className="chat-scrollbar">
        {messages.map(msg => (
          <div 
            key={msg.id}
            style={{
              alignSelf: msg.sender === 'Emma' ? 'flex-start' : 'flex-end',
              background: msg.sender === 'Emma' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
              border: msg.sender === 'Emma' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
              padding: '10px 14px',
              borderRadius: msg.sender === 'Emma' ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
              maxWidth: '85%',
              boxShadow: msg.sender === 'Emma' ? 'none' : '0 4px 12px rgba(255, 255, 255, 0.1)',
              animation: 'chatEntrance 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
            }}
          >
            <p style={{ margin: 0, fontSize: '12.5px', color: msg.sender === 'Emma' ? 'white' : '#0f172a', lineHeight: '1.45', fontWeight: '500' }}>{msg.text}</p>
          </div>
        ))}

        {isTyping && (
          <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '10px 14px', borderRadius: '14px 14px 14px 4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', animation: 'pulse 0.8s infinite alternate' }} />
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', animation: 'pulse 0.8s infinite alternate 0.15s' }} />
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.7)', animation: 'pulse 0.8s infinite alternate 0.3s' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Chips */}
      <div style={{ padding: '0 16px 8px 16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {OPTIONS.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionClick(opt)}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.8)',
                padding: '6px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Text Input Panel */}
      <form onSubmit={handleSendText} style={{ display: 'flex', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(0,0,0,0.15)' }}>
        <input 
          type="text" 
          placeholder="Ask Emma about features, price..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '12px 16px',
            color: 'white',
            fontSize: '12px',
            fontFamily: 'Outfit, sans-serif'
          }}
        />
        <button 
          type="submit" 
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '0 16px',
            color: inputText.trim() ? '#ffffff' : 'rgba(255,255,255,0.3)',
            cursor: inputText.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s'
          }}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

// --- Main Premium Landing Page ---
export default function DemoLandingPage() {
  const scrollContainerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  // Redesign Core State: Workspace tabs & calculators
  const [workspaceTab, setWorkspaceTab] = useState('webgl'); // webgl | floorplan | renders | ar
  
  // WebGL Interactive telemetries
  const [webglPreset, setWebglPreset] = useState('orbit'); // orbit | walk | topdown
  const [fps, setFps] = useState(60.0);
  const [dialAngle, setDialAngle] = useState({ x: 42.4, y: -15.8 });

  // Vector Floorplan Beacons
  const [selectedHotspot, setSelectedHotspot] = useState('pool'); // pool | bedroom | lounge
  const HOTSPOTS = {
    pool: { title: "Infinity Pool Deck", size: "120 m²", material: "Teak & Terrazzo", view: "Sunset Panoramic View" },
    bedroom: { title: "Penthouse Master Suite", size: "85 m²", material: "White Calacatta", view: "East Bay Ocean Horizon" },
    lounge: { title: "Sunken Sky Lounge", size: "140 m²", material: "Suede & Travertine", view: "360° Mountain Skyline" }
  };

  // Render Filters Showcase
  const [activeFilter, setActiveFilter] = useState('none'); // none | sunset | wireframe | clay
  
  // ROI Slider states
  const [projectsCount, setProjectsCount] = useState(3);
  const [rendersCount, setRendersCount] = useState(15);
  const [arSeats, setArSeats] = useState(5);
  const [calculatorStep, setCalculatorStep] = useState('idle'); // idle | calculating | success

  // Live Unit Matrix clicks
  const [unitStatus, setUnitStatus] = useState({
    A101: 'available', A102: 'reserved', A201: 'selected', A202: 'available',
    P301: 'available', P302: 'reserved', P303: 'available', P304: 'selected',
    V401: 'available', V402: 'available', V403: 'reserved', V404: 'available'
  });

  const toggleUnit = (id) => {
    setUnitStatus(prev => {
      const current = prev[id];
      let next = 'available';
      if (current === 'available') next = 'selected';
      else if (current === 'selected') next = 'reserved';
      else if (current === 'reserved') next = 'available';
      return { ...prev, [id]: next };
    });
  };

  // Simulate dynamically fluctuating WebGL FPS & Coordinates
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(parseFloat((59.6 + Math.random() * 0.8).toFixed(1)));
      setDialAngle(prev => ({
        x: parseFloat((prev.x + (Math.random() - 0.5) * 0.1).toFixed(1)),
        y: parseFloat((prev.y + (Math.random() - 0.5) * 0.08).toFixed(1))
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculatedCost = useMemo(() => {
    const baseSaaS = 199;
    const projectCost = projectsCount * 150;
    const renderCost = rendersCount * 45;
    const seatCost = arSeats * 25;
    return baseSaaS + projectCost + renderCost + seatCost;
  }, [projectsCount, rendersCount, arSeats]);

  const handleCheckoutSim = () => {
    setCalculatorStep('calculating');
    setTimeout(() => {
      setCalculatorStep('success');
    }, 1500);
  };

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
        /* Dynamic aesthetic control parameters */
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
          background: #3b82f6;
          color: #ffffff;
        }

        .bento-card-premium {
          background: rgba(16, 18, 26, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(40px) saturate(220%);
          -webkit-backdrop-filter: blur(40px) saturate(220%);
          border-radius: 28px;
          padding: 32px;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 16px 36px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
        }

        .bento-card-premium:hover {
          border-color: rgba(255,255,255,0.25);
          background: rgba(20, 24, 36, 0.55);
          transform: translateY(-4px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.25);
        }

        .dot-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 24px 24px;
          z-index: 1;
          pointer-events: none;
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

        .wave-line {
          width: 3px;
          border-radius: 2px;
          background: #38bdf8;
          animation: audioWave 1.2s infinite ease-in-out alternate;
          transition: height 0.3s;
        }
        @keyframes audioWave {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(1.5); }
        }

        @keyframes chatEntrance {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .chat-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 4px;
        }

        @keyframes pulse {
          from { opacity: 0.3; }
          to { opacity: 1; }
        }

        /* Ambient rotating keyframes */
        @keyframes rotateDials {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1100px) {
          .bento-card-premium {
             grid-column: span 12 !important;
          }
        }

        @media (max-width: 768px) {
          .hero-main-title { font-size: 52px !important; line-height: 1.1 !important; letter-spacing: -2px !important; }
          .hero-desc { font-size: 16px !important; margin-bottom: 24px !important; }
          .bento-card-premium { padding: 20px !important; }
          .everything-headline { font-size: 34px !important; }
        }
      `}</style>

      <div className="dot-overlay" />

      {/* NAVBAR */}
      <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 5 }}>
          <div style={{ background: 'linear-gradient(135deg, #00c6ff, #0072ff)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0, 198, 255, 0.4)' }}>
            <Box color="#ffffff" size={18} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '2px', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Outfit, sans-serif' }}>PROTECH</span>
        </div>
        <div style={{ position: 'relative', zIndex: 5 }}>
          <Link to="/" className="cta-btn-main" style={{ textDecoration: 'none', padding: '8px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            View Live App <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION - Keep beautiful Top 3D Liquid Crystal Wave Background */}
      <section style={{ position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center', overflow: 'hidden' }}>
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

      {/* NEW BREATHTAKING REDESIGNED WORKSPACE & INTERACTIVE SUITE */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 40px 100px 40px', position: 'relative', zIndex: 3 }}>
        <h2 className="everything-headline" style={{ fontSize: '48px', fontWeight: '900', marginBottom: '60px', textAlign: 'center', letterSpacing: '-2px' }}>
          Interactive Spatial Control Center. <br />
          <span style={{ fontSize: '17px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', letterSpacing: '0px' }}>Click tabs to interact with different spatial telemetry, layout tools, and calculations</span>
        </h2>

        {/* INTERACTIVE WORKSPACE WIDGET */}
        <div className="bento-card-premium" style={{ gridColumn: 'span 12', padding: 0, minHeight: '620px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 255, 255, 0.14)', overflow: 'hidden' }}>
          
          {/* Workstation Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(10, 12, 18, 0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 'bold', marginLeft: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Protech Interactive Deck v2.4
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }} />
              <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold' }}>Active Session Connection</span>
            </div>
          </div>

          <div style={{ display: 'flex', flex: 1, flexDirection: 'row', minHeight: '520px', flexWrap: 'wrap' }}>
            
            {/* Left Workspace Navigation Sidebar */}
            <div style={{ width: '220px', background: 'rgba(10, 12, 18, 0.2)', borderRight: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '8px' }}>
                EXPLORATION VIEWPORTS
              </span>
              {[
                { id: 'webgl', label: 'WebGL Realtime', icon: <Cpu size={14} /> },
                { id: 'floorplan', label: 'Vector Floorplans', icon: <Layers size={14} /> },
                { id: 'renders', label: 'Render Showcase', icon: <ImageIcon size={14} /> },
                { id: 'ar', label: 'Native WebAR Space', icon: <Smartphone size={14} /> }
              ].map(tab => {
                const isActive = workspaceTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setWorkspaceTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: isActive ? '#38bdf8' : 'rgba(255,255,255,0.65)',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isActive ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                      }
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
              
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.35)', padding: '0 8px' }}>
                <span style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', color: 'rgba(255,255,255,0.5)' }}>Device:</span>
                Vite client / Chromium
              </div>
            </div>

            {/* Right Interactive Telemetry Preview Window */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#070b13', minWidth: '320px' }}>
              
              {/* TAB 1: WEBGL VIEWER & REALTIME TELEMETRY */}
              {workspaceTab === 'webgl' && (
                <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '480px', display: 'flex', flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
                  <img src="/mockups/3d_viewer.png" alt="3D WebGL Mockup" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.65, zIndex: 0 }} />
                  
                  {/* Overlay Gradient */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #070b13 0%, rgba(7,11,19,0.9) 35%, rgba(7,11,19,0.1) 100%)', zIndex: 1 }} />
                  
                  {/* Left Column Description */}
                  <div style={{ position: 'relative', zIndex: 2, maxWidth: '420px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '30px', border: '1px solid rgba(56,189,248,0.3)', color: '#38bdf8', fontSize: '10px', fontWeight: 'bold', background: 'rgba(56,189,248,0.06)', width: 'fit-content', marginBottom: '16px', letterSpacing: '0.5px' }}>
                      <Activity size={10} /> WEBGL ENGINE PREVIEW
                    </div>
                    <h3 style={{ fontSize: '38px', fontWeight: '900', lineHeight: '1.1', marginBottom: '16px', letterSpacing: '-1.5px' }}>
                      Unmatched <br/>WebGL Power.
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', fontWeight: '500' }}>
                      Clients freely orbit, walk through, and analyze structural assets in real-time right inside their browser. Features dynamic shadows, high-poly materials, and immediate frame rates.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['webgl2', '60fps', '0-plugins'].map((feature) => (
                        <span key={feature} style={{ padding: '6px 12px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Floating WebGL Diagnostics Hud */}
                  <div style={{ position: 'relative', zIndex: 2, marginLeft: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'flex-start', alignSelf: 'center', marginRight: '24px' }}>
                    <div className="bento-card-premium" style={{ background: 'rgba(10, 12, 18, 0.8)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '18px', padding: '20px', minWidth: '220px', backdropFilter: 'blur(30px)' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                        ACTIVE ENGINE STATS
                      </span>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.6)' }}>Frame Rate:</span>
                          <span style={{ fontSize: '12.5px', color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1s infinite alternate' }} />
                            {fps} FPS
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.6)' }}>Draw Calls:</span>
                          <span style={{ fontSize: '11.5px', color: 'white', fontWeight: 'bold' }}>148 / frame</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.6)' }}>Polys count:</span>
                          <span style={{ fontSize: '11.5px', color: 'white', fontWeight: 'bold' }}>1.42 M Triangles</span>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                          ACTIVE ANGLE TELEMETRY
                        </span>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#eab308', fontWeight: 'bold' }}>
                          <span style={{ background: 'rgba(234,179,8,0.08)', padding: '2px 6px', borderRadius: '4px' }}>Pitch: {dialAngle.x}°</span>
                          <span style={{ background: 'rgba(234,179,8,0.08)', padding: '2px 6px', borderRadius: '4px' }}>Yaw: {dialAngle.y}°</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {[
                        { id: 'orbit', label: 'Orbit Cam' },
                        { id: 'walk', label: 'Walk Cam' },
                        { id: 'topdown', label: 'Top-Down' }
                      ].map(preset => {
                        const isPresetActive = webglPreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => {
                              setWebglPreset(preset.id);
                              // Mock changes in the coordinate angles when presets change
                              if (preset.id === 'orbit') setDialAngle({ x: 42.4, y: -15.8 });
                              else if (preset.id === 'walk') setDialAngle({ x: 0.0, y: 92.4 });
                              else setDialAngle({ x: -90.0, y: 0.0 });
                            }}
                            style={{
                              background: isPresetActive ? '#ffffff' : 'rgba(10, 12, 18, 0.6)',
                              color: isPresetActive ? '#0a0c10' : '#ffffff',
                              border: isPresetActive ? 'none' : '1px solid rgba(255, 255, 255, 0.14)',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '10.5px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: isPresetActive ? '0 4px 12px rgba(255, 255, 255, 0.15)' : 'none'
                            }}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SMART VECTOR FLOORPLAN INTERACTION */}
              {workspaceTab === 'floorplan' && (
                <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '30px', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', fontSize: '10px', fontWeight: 'bold', background: 'rgba(139,92,246,0.06)', width: 'fit-content', marginBottom: '16px' }}>
                    <Layers3 size={10} /> VECTOR FLOORPLAN MATRIX
                  </div>
                  
                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
                    
                    {/* Architectural Vector Floorplan Map */}
                    <div style={{
                      position: 'relative',
                      width: '280px',
                      height: '240px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '16px',
                      border: '1px dashed rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {/* Grid walls */}
                      <div style={{ position: 'absolute', width: '90%', height: '90%', border: '1px solid rgba(255,255,255,0.05)' }} />
                      <div style={{ position: 'absolute', width: '50%', height: '90%', borderRight: '1px solid rgba(255,255,255,0.05)' }} />
                      <div style={{ position: 'absolute', width: '90%', height: '50%', borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
                      
                      {/* Beacon Hotspot 1: Infinity Pool */}
                      <button 
                        onClick={() => setSelectedHotspot('pool')}
                        style={{
                          position: 'absolute', top: '35%', left: '25%',
                          width: '22px', height: '22px', borderRadius: '50%',
                          border: '2px solid #38bdf8',
                          background: selectedHotspot === 'pool' ? '#38bdf8' : 'rgba(56,189,248,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          boxShadow: '0 0 12px rgba(56,189,248,0.4)',
                          transition: 'all 0.2s', outline: 'none'
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />
                      </button>
                      <span style={{ position: 'absolute', top: '23%', left: '23%', fontSize: '9px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)' }}>POOL DECK</span>

                      {/* Beacon Hotspot 2: Master Suite */}
                      <button 
                        onClick={() => setSelectedHotspot('bedroom')}
                        style={{
                          position: 'absolute', top: '65%', left: '68%',
                          width: '22px', height: '22px', borderRadius: '50%',
                          border: '2px solid #8b5cf6',
                          background: selectedHotspot === 'bedroom' ? '#8b5cf6' : 'rgba(139,92,246,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          boxShadow: '0 0 12px rgba(139,92,246,0.4)',
                          transition: 'all 0.2s', outline: 'none'
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />
                      </button>
                      <span style={{ position: 'absolute', top: '78%', left: '60%', fontSize: '9px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)' }}>PENTHOUSE SUITE</span>

                      {/* Beacon Hotspot 3: Sky Lounge */}
                      <button 
                        onClick={() => setSelectedHotspot('lounge')}
                        style={{
                          position: 'absolute', top: '25%', left: '72%',
                          width: '22px', height: '22px', borderRadius: '50%',
                          border: '2px solid #f59e0b',
                          background: selectedHotspot === 'lounge' ? '#f59e0b' : 'rgba(245,158,11,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          boxShadow: '0 0 12px rgba(245,158,11,0.4)',
                          transition: 'all 0.2s', outline: 'none'
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />
                      </button>
                      <span style={{ position: 'absolute', top: '13%', left: '69%', fontSize: '9px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)' }}>SKY LOUNGE</span>
                    </div>

                    {/* Hotspot details sidebar */}
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div className="bento-card-premium" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', marginBottom: '14px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '900', color: 'white' }}>{HOTSPOTS[selectedHotspot].title}</span>
                          <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '10px', color: '#10b981', fontWeight: 'bold' }}>Active hotspot</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
                          <div><strong style={{ color: 'white' }}>Total Area Size:</strong> {HOTSPOTS[selectedHotspot].size}</div>
                          <div><strong style={{ color: 'white' }}>Premium Finishes:</strong> {HOTSPOTS[selectedHotspot].material}</div>
                          <div><strong style={{ color: 'white' }}>Spatial Exposure:</strong> {HOTSPOTS[selectedHotspot].view}</div>
                        </div>

                        <div style={{ marginTop: '16px', fontSize: '10.5px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                          * Tapping coordinate hotspots on the vector plans rotates the WebGL viewport camera directly to target rooms.
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: HIGH-POLY RENDER SHOWCASE WITH FILTERS */}
              {workspaceTab === 'renders' && (
                <div style={{ padding: '36px', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '30px', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: '10px', fontWeight: 'bold', background: 'rgba(16,185,129,0.06)', width: 'fit-content', marginBottom: '16px' }}>
                    <ImageIcon size={10} /> ASPECT FILTER SHOWCASE
                  </div>

                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                    <div style={{ position: 'relative', width: '300px', height: '200px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }}>
                      <img 
                        src="/mockups/render_gallery.png" 
                        alt="High Poly Villa" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          filter: activeFilter === 'none' ? 'none' : 
                                  activeFilter === 'sunset' ? 'contrast(1.1) brightness(0.9) sepia(0.2) saturate(1.4)' :
                                  activeFilter === 'wireframe' ? 'contrast(2) brightness(1.5) grayscale(1) invert(0.1)' :
                                  'contrast(0.9) brightness(1.2) grayscale(0.85)'
                        }} 
                      />
                      
                      {activeFilter === 'wireframe' && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '1px solid rgba(56,189,248,0.2)', backgroundImage: 'linear-gradient(rgba(56,189,248,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.1) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                      )}

                      <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(10, 12, 18, 0.75)', backdropFilter: 'blur(10px)', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Filter active: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{activeFilter.toUpperCase()}</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <h4 style={{ fontSize: '18px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Asset Render Filter Engine</h4>
                      <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '16px' }}>
                        Seamlessly swap shaders and ambient filters to display sunrise coordinates, daylight vectors, architectural wireframe structures, or simplified clay forms instantly.
                      </p>
                      
                      {/* Filter preset choices */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {[
                          { id: 'none', label: 'Photorealistic' },
                          { id: 'sunset', label: 'Sunset Chill' },
                          { id: 'wireframe', label: 'Tech Wireframe' },
                          { id: 'clay', label: 'Clay Model' }
                        ].map(f => (
                          <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            style={{
                              background: activeFilter === f.id ? '#10b981' : 'rgba(255,255,255,0.03)',
                              border: activeFilter === f.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '11px',
                              fontWeight: '700',
                              color: 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: NATIVE WEBAR PROJECTION SIMULATOR */}
              {workspaceTab === 'ar' && (
                <div style={{ padding: '36px', display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '30px', border: '1px solid rgba(234,179,8,0.3)', color: '#eab308', fontSize: '10px', fontWeight: 'bold', background: 'rgba(234,179,8,0.06)', width: 'fit-content', marginBottom: '16px' }}>
                    <Smartphone size={10} /> WEBAR SPATIAL CALIBRATOR
                  </div>

                  <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
                    
                    {/* Simulated mobile viewport */}
                    <div style={{
                      width: '160px',
                      height: '250px',
                      borderRadius: '24px',
                      border: '6px solid rgba(255,255,255,0.18)',
                      position: 'relative',
                      background: '#131924',
                      overflow: 'hidden',
                      flexShrink: 0,
                      boxShadow: '0 16px 32px rgba(0,0,0,0.5)'
                    }}>
                      {/* Speaker notch */}
                      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '50px', height: '10px', background: 'rgba(255,255,255,0.18)', borderBottomLeftRadius: '6px', zIndex: 5 }} />
                      
                      {/* AR Camera Scene Mockup */}
                      <img src="/mockups/ar_technology.png" alt="AR technology" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                      
                      {/* Interactive Alignment Brackets */}
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', border: '1px dashed rgba(234,179,8,0.6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '8px', height: '8px', borderLeft: '2px solid #eab308', borderTop: '2px solid #eab308', position: 'absolute', top: '-2px', left: '-2px' }} />
                        <div style={{ width: '8px', height: '8px', borderRight: '2px solid #eab308', borderTop: '2px solid #eab308', position: 'absolute', top: '-2px', right: '-2px' }} />
                        <div style={{ width: '8px', height: '8px', borderLeft: '2px solid #eab308', borderBottom: '2px solid #eab308', position: 'absolute', bottom: '-2px', left: '-2px' }} />
                        <div style={{ width: '8px', height: '8px', borderRight: '2px solid #eab308', borderBottom: '2px solid #eab308', position: 'absolute', bottom: '-2px', right: '-2px' }} />
                        
                        <span style={{ fontSize: '7px', fontWeight: 'bold', color: '#eab308', animation: 'pulse 0.8s infinite alternate' }}>CALIBRATING...</span>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <h4 style={{ fontSize: '18px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>Native Augmented Reality View</h4>
                      <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '16px' }}>
                        Project structural complexes right onto boardroom tables. Uses native spatial meshes and tracking vectors. iOS and Android browsers compile natively with zero app installs.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#f8fafc', fontWeight: 'bold' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check size={12} color="#10b981" /> No Application Installs Required
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check size={12} color="#10b981" /> Interactive 1:1 True-Scale Projections
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Check size={12} color="#10b981" /> Real-time Shadow Depth Masking
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* BOTTOM GRIDS: CONCISE AI CHAT, ACTIVE CALCULATOR, & CLICKABLE INVENTORY MAP */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', marginTop: '48px' }}>
          
          {/* AI Sales Concierge Card (Span 4) */}
          <div className="bento-card-premium" style={{ gridColumn: 'span 4', padding: 0, display: 'flex', flexDirection: 'column', height: '420px', minWidth: '280px' }}>
            <BentoAIChat />
          </div>

          {/* NEW ROI CALCULATOR CARD (Span 4) */}
          <div className="bento-card-premium" style={{ gridColumn: 'span 4', height: '420px', minWidth: '280px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', fontSize: '9px', fontWeight: 'bold', background: 'rgba(59,130,246,0.06)', marginBottom: '8px' }}>
                <DollarSign size={10} /> VALUE CONFIGURATOR
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>Interactive ROI Calculator</h3>
            </div>

            {calculatorStep !== 'success' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                {/* Slider 1: Properties count */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)' }}>
                    <span>Active Properties:</span>
                    <span style={{ color: '#38bdf8' }}>{projectsCount} Project{projectsCount > 1 ? 's' : ''}</span>
                  </div>
                  <input 
                    type="range" min="1" max="20" step="1" 
                    value={projectsCount} 
                    onChange={(e) => setProjectsCount(parseInt(e.target.value))}
                    style={{
                      WebkitAppearance: 'none', appearance: 'none', width: '100%', height: '4px',
                      background: `linear-gradient(to right, #38bdf8 ${((projectsCount - 1) / 19 * 100)}%, rgba(255,255,255,0.12) ${((projectsCount - 1) / 19 * 100)}%)`,
                      borderRadius: '2px', outline: 'none', cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Slider 2: High-Poly Renders */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)' }}>
                    <span>High-Poly Renders:</span>
                    <span style={{ color: '#8b5cf6' }}>{rendersCount} Renders</span>
                  </div>
                  <input 
                    type="range" min="5" max="100" step="5" 
                    value={rendersCount} 
                    onChange={(e) => setRendersCount(parseInt(e.target.value))}
                    style={{
                      WebkitAppearance: 'none', appearance: 'none', width: '100%', height: '4px',
                      background: `linear-gradient(to right, #8b5cf6 ${((rendersCount - 5) / 95 * 100)}%, rgba(255,255,255,0.12) ${((rendersCount - 5) / 95 * 100)}%)`,
                      borderRadius: '2px', outline: 'none', cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Slider 3: AR Seats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)' }}>
                    <span>AR Seat Users:</span>
                    <span style={{ color: '#eab308' }}>{arSeats} Seats</span>
                  </div>
                  <input 
                    type="range" min="2" max="50" step="1" 
                    value={arSeats} 
                    onChange={(e) => setArSeats(parseInt(e.target.value))}
                    style={{
                      WebkitAppearance: 'none', appearance: 'none', width: '100%', height: '4px',
                      background: `linear-gradient(to right, #eab308 ${((arSeats - 2) / 48 * 100)}%, rgba(255,255,255,0.12) ${((arSeats - 2) / 48 * 100)}%)`,
                      borderRadius: '2px', outline: 'none', cursor: 'pointer'
                    }}
                  />
                </div>

                {/* Real-time Pricing Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>CALCULATED VALUE:</span>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>${calculatedCost} <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 'normal' }}>/ mo</span></span>
                  </div>
                  
                  <button 
                    onClick={handleCheckoutSim}
                    disabled={calculatorStep === 'calculating'}
                    style={{
                      background: 'white', color: '#0f172a', border: 'none', borderRadius: '8px',
                      padding: '8px 14px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '4px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {calculatorStep === 'calculating' ? (
                      <>
                        <RefreshCw size={10} style={{ animation: 'rotateDials 1s infinite linear' }} /> Estimating
                      </>
                    ) : (
                      <>
                        Get Estimate <ArrowRight size={10} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {calculatorStep === 'success' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: '16px', animation: 'chatEntrance 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(16,185,129,0.2)' }}>
                  <Check size={20} color="#10b981" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'white' }}>Calculated pricing sent!</h4>
                  <p style={{ fontSize: '11.5px', color: '#94a3b8', maxWidth: '240px', lineHeight: '1.45' }}>
                    An official spatial rendering quote based on <strong>{projectsCount} active projects</strong> has been loaded. Check Emma's chat thread!
                  </p>
                </div>
                <button
                  onClick={() => setCalculatorStep('idle')}
                  style={{
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.14)',
                    color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '10.5px',
                    fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  Recalculate Sliders
                </button>
              </div>
            )}
          </div>

          {/* NEW LIVE CLICKABLE INVENTORY MAP (Span 4) */}
          <div className="bento-card-premium" style={{ gridColumn: 'span 4', height: '420px', minWidth: '280px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(236,72,153,0.3)', color: '#ec4899', fontSize: '9px', fontWeight: 'bold', background: 'rgba(236,72,153,0.06)', marginBottom: '8px' }}>
                <LayoutGrid size={10} /> CRM INTEGRATION MATRIX
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>Live Interactive Inventory</h3>
            </div>

            {/* Clickable Unit Grid Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                SELECT FLOORS TO CHECK AVAILABILITY:
              </span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Level 3: Penthouses */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#ec4899', width: '30px', textTransform: 'uppercase' }}>LVL 3</span>
                  {['P301', 'P302', 'P303', 'P304'].map((id) => {
                    const status = unitStatus[id];
                    return (
                      <button
                        key={id}
                        onClick={() => toggleUnit(id)}
                        style={{
                          flex: 1, padding: '10px 4px', borderRadius: '8px', fontSize: '10.5px', fontWeight: 'bold',
                          cursor: 'pointer', outline: 'none', transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          textAlign: 'center',
                          background: status === 'selected' ? 'rgba(59, 130, 246, 0.25)' : 
                                      status === 'reserved' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                          color: status === 'selected' ? '#60a5fa' :
                                 status === 'reserved' ? '#f87171' : 'rgba(255,255,255,0.8)',
                          border: status === 'selected' ? '1px solid #3b82f6' :
                                  status === 'reserved' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                          boxShadow: status === 'selected' ? '0 0 10px rgba(59, 130, 246, 0.25)' : 'none'
                        }}
                      >
                        {id}
                      </button>
                    );
                  })}
                </div>

                {/* Level 2: Suites */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#ec4899', width: '30px', textTransform: 'uppercase' }}>LVL 2</span>
                  {['A201', 'A202', 'A101', 'A102'].map((id) => {
                    const status = unitStatus[id];
                    return (
                      <button
                        key={id}
                        onClick={() => toggleUnit(id)}
                        style={{
                          flex: 1, padding: '10px 4px', borderRadius: '8px', fontSize: '10.5px', fontWeight: 'bold',
                          cursor: 'pointer', outline: 'none', transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          textAlign: 'center',
                          background: status === 'selected' ? 'rgba(59, 130, 246, 0.25)' : 
                                      status === 'reserved' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                          color: status === 'selected' ? '#60a5fa' :
                                 status === 'reserved' ? '#f87171' : 'rgba(255,255,255,0.8)',
                          border: status === 'selected' ? '1px solid #3b82f6' :
                                  status === 'reserved' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                          boxShadow: status === 'selected' ? '0 0 10px rgba(59, 130, 246, 0.25)' : 'none'
                        }}
                      >
                        {id}
                      </button>
                    );
                  })}
                </div>

                {/* Level 1: Villas */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#ec4899', width: '30px', textTransform: 'uppercase' }}>LVL 1</span>
                  {['V401', 'V402', 'V403', 'V404'].map((id) => {
                    const status = unitStatus[id];
                    return (
                      <button
                        key={id}
                        onClick={() => toggleUnit(id)}
                        style={{
                          flex: 1, padding: '10px 4px', borderRadius: '8px', fontSize: '10.5px', fontWeight: 'bold',
                          cursor: 'pointer', outline: 'none', transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          textAlign: 'center',
                          background: status === 'selected' ? 'rgba(59, 130, 246, 0.25)' : 
                                      status === 'reserved' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                          color: status === 'selected' ? '#60a5fa' :
                                 status === 'reserved' ? '#f87171' : 'rgba(255,255,255,0.8)',
                          border: status === 'selected' ? '1px solid #3b82f6' :
                                  status === 'reserved' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                          boxShadow: status === 'selected' ? '0 0 10px rgba(59, 130, 246, 0.25)' : 'none'
                        }}
                      >
                        {id}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status color indicator guides */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '10px', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} /> Available
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} /> Reserved
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} /> Selected
                </div>
              </div>
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
