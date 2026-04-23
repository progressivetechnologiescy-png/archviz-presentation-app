import React, { useState, useEffect, Suspense } from 'react';
import { Layers, Image as ImageIcon, Map, Hexagon, Component, Settings, Info, ListChecks, Share2, Video, Menu, X, Maximize, Eye } from 'lucide-react';
import { useViewerStore } from '../store/viewerStore';
import { supabase } from '../lib/supabase';
import ProjectOverview from '../views/ProjectOverview';
import CinematicsTab from '../views/CinematicsTab';
import RendersGallery from '../views/RendersGallery';
import FloorplanViewer from '../views/FloorplanViewer';
import ProjectMap from '../views/ProjectMap';
import PanoramaViewer from '../views/PanoramaViewer';
import AvailabilityTab from '../views/AvailabilityTab';
import AssetManager from '../views/AssetManager';
import StandaloneView from './StandaloneView';
import MobileARView from '../views/MobileARView';
import ShareModal from '../components/ShareModal';
import FloatingConcierge from '../components/FloatingConcierge';

const TabButton = (props) => {
  const [isHovered, setIsHovered] = useState(false);
  const IconToRender = props.icon;
  return (
    <button 
      className="nav-tab-btn"
      onClick={props.onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', cursor: 'pointer', borderRadius: '12px',
        background: props.active ? 'var(--accent-color)' : (isHovered ? 'rgba(255,255,255,0.1)' : 'transparent'),
        border: 'none',
        color: 'white',
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)', fontWeight: '600',
        boxShadow: props.active ? '0 4px 12px var(--accent-glow)' : 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        opacity: props.active ? 1 : (isHovered ? 1 : 0.85),
        padding: props.isMobile ? '16px 24px' : undefined,
        width: props.isMobile ? '100%' : 'auto',
        justifyContent: props.isMobile ? 'flex-start' : 'center',
        fontSize: props.isMobile ? '18px' : undefined,
        gap: props.isMobile ? '16px' : undefined
      }}
    >
      <IconToRender className="nav-tab-icon" style={props.isMobile ? { width: '24px', height: '24px', display: 'block' } : undefined} /> 
      <span className="nav-tab-label">{props.label}</span>
    </button>
  );
};

export default function PresentationApp({ forceAdmin = false }) {
  const fetchCloudAssets = useViewerStore(state => state.fetchCloudAssets);
  const isLightboxOpen = useViewerStore(state => state.isLightboxOpen);
  const isGlobalScrolled = useViewerStore(state => state.isGlobalScrolled);
  const projectTitle = useViewerStore(state => state.projectTitle);
  const companyName = useViewerStore(state => state.companyName);
  const logoUrl = useViewerStore(state => state.logoUrl);
  
  const [isAdmin] = useState(() => {
    if (forceAdmin) return true;
    const params = new URLSearchParams(window.location.search);
    return params.get('admin') === 'true';
  });
  const themeMode = useViewerStore(state => state.themeMode);
  const accentColor = useViewerStore(state => state.accentColor);
  
  const [activeTab, setActiveTab] = useState(isAdmin ? 'manage' : 'overview');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(window.innerWidth <= 1100);

  useEffect(() => {
    const handleResize = () => setIsMobileDevice(window.innerWidth <= 1100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Automatically wire the client state to the Cloud Database on app load!
  useEffect(() => {
    fetchCloudAssets(supabase);
  }, [fetchCloudAssets]);

  // Inject Theme Mode and Accent Color globally
  useEffect(() => {
    if (themeMode === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [themeMode, accentColor]);

  // Reset scroll state on tab switch
  useEffect(() => {
    useViewerStore.getState().setGlobalScrolled(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileMenuOpen(false); // Close mobile menu on navigate
  }, [activeTab]);

  return (
    <div style={{ width: '100vw', height: '100dvh', position: 'relative', background: 'var(--bg-gradient)', overflow: 'hidden' }}>
      
      {/* Global Responsive Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'nowrap', gap: '24px',
        background: isGlobalScrolled || isMobileMenuOpen ? 'rgba(10, 12, 16, 0.95)' : 'transparent', 
        backdropFilter: isGlobalScrolled || isMobileMenuOpen ? 'blur(24px)' : 'none', 
        borderBottom: isGlobalScrolled || isMobileMenuOpen ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        opacity: isLightboxOpen ? 0 : 1, 
        pointerEvents: isLightboxOpen ? 'none' : 'auto', 
        transition: 'all 0.3s ease',
        transform: isLightboxOpen ? 'translateY(-20px)' : 'translateY(0)'
      }}>
        <style>{`
          .nav-tab-btn { padding: 10px 20px; font-size: 14px; gap: 8px; }
          .nav-tab-icon { width: 16px; height: 16px; }
          
          @media (max-width: 1500px) {
            .nav-tab-btn { padding: 8px 12px; font-size: 13px; gap: 4px; }
            .nav-tab-icon { width: 14px; height: 14px; }
            .action-text { display: none !important; }
            .header-actions button { padding: 12px !important; border-radius: 50% !important; width: 48px; height: 48px; justify-content: center; }
          }
          @media (max-width: 1350px) {
            .desktop-logo-text { display: none !important; }
          }
          @media (max-width: 1100px) {
            .desktop-nav { display: none !important; }
            .mobile-nav-toggle { display: flex !important; }
            .header-manage-btn { display: none !important; }
            .fullscreen-btn { display: none !important; }
          }
          @media (min-width: 1101px) {
            .mobile-nav-toggle { display: none !important; }
          }
          @media (max-width: 600px) {
            .header-container { padding: 16px !important; }
          }
        `}</style>
        
        {/* Floating Logo - Top Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, pointerEvents: 'none', zIndex: 102 }}>
          <div style={{ 
            width: '48px', height: '48px', background: 'linear-gradient(135deg, var(--accent-color), #60a5fa)', 
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px var(--accent-glow), 0 4px 12px rgba(0,0,0,0.5)', overflow: 'hidden'
          }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'rgba(255,255,255,0.9)' }} />
            ) : (
              <Hexagon size={28} color="#fff" />
            )}
          </div>
          <div className="desktop-logo-text">
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', letterSpacing: '0.5px', textShadow: activeTab === 'manage' ? 'none' : '0 2px 12px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', color: activeTab === 'manage' ? 'var(--text-primary)' : 'white' }}>{projectTitle}</h1>
            <p style={{ margin: '2px 0 0', color: activeTab === 'manage' ? 'var(--text-secondary)' : 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: '600', letterSpacing: '2px', textShadow: activeTab === 'manage' ? 'none' : '0 1px 8px rgba(0,0,0,0.9)', whiteSpace: 'nowrap' }}>{companyName}</p>
          </div>
        </div>

        {/* Desktop Navigation Pill */}
        {activeTab !== 'manage' ? (
          <div className="desktop-nav" style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
            <div className="glass-panel" style={{ 
              display: 'flex', gap: '4px', padding: '6px', borderRadius: '16px',
              background: 'rgba(10, 12, 16, 0.8)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}>
              <TabButton active={activeTab === 'overview'} icon={Info} label="Overview" onClick={() => setActiveTab('overview')} />
              <TabButton active={activeTab === 'renders'} icon={ImageIcon} label="Renders" onClick={() => setActiveTab('renders')} />
              <TabButton active={activeTab === 'cinematics'} icon={Video} label="Videos" onClick={() => setActiveTab('cinematics')} />
              <TabButton active={activeTab === 'floorplans'} icon={Layers} label="Floorplans" onClick={() => setActiveTab('floorplans')} />
              <TabButton active={activeTab === 'availability'} icon={ListChecks} label="Availability" onClick={() => setActiveTab('availability')} />
              <TabButton active={activeTab === 'map'} icon={Map} label="Location" onClick={() => setActiveTab('map')} />
              <TabButton active={activeTab === 'panorama'} icon={Hexagon} label="360° Tours" onClick={() => setActiveTab('panorama')} />
              <TabButton active={activeTab === '3d'} icon={Component} label="3D Interactive" onClick={() => setActiveTab('3d')} />
            </div>
          </div>
        ) : (
          <div className="desktop-nav" style={{ flex: 1 }} /> /* Empty spacer when in manage mode */
        )}

        {/* Desktop Global Controls */}
        <div className="header-actions-container" style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 102, flexShrink: 0 }}>
          
          {isAdmin && (
            <button 
              onClick={() => {
                if (activeTab === 'manage') {
                  window.open(window.location.origin, '_blank');
                } else {
                  setActiveTab('manage');
                }
              }}
              className="glass-panel hover-lift header-manage-btn" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '30px', background: activeTab === 'manage' ? 'rgba(255,255,255,0.1)' : 'var(--accent-color)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold' }}>
              {activeTab === 'manage' ? <Eye size={16} /> : <Settings size={16} />}
              <span className="action-text">{activeTab === 'manage' ? 'View App' : 'Manage'}</span>
            </button>
          )}

          <button 
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => console.log(err));
              } else {
                document.exitFullscreen();
              }
            }}
            className="glass-panel hover-lift icon-action-btn fullscreen-btn" 
            title="Fullscreen"
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              width: '48px', height: '48px', padding: '0', 
              borderRadius: '50%', background: 'rgba(10, 12, 16, 0.8)', cursor: 'pointer', 
              border: '1px solid rgba(255,255,255,0.1)', color: 'white' 
            }}>
            <Maximize size={18} />
          </button>

          {/* Share Button (Hidden on Manage) */}
          {activeTab !== 'manage' && (
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="glass-panel hover-lift icon-action-btn" 
              title="Share"
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                width: '48px', height: '48px', padding: '0', 
                borderRadius: '50%', background: 'rgba(10, 12, 16, 0.8)', cursor: 'pointer', 
                border: '1px solid rgba(255,255,255,0.1)', color: 'white' 
              }}>
              <Share2 size={18} />
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button 
            className="mobile-nav-toggle glass-panel icon-action-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ 
              width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(10, 12, 16, 0.8)', 
              border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>


      {/* Mobile Full-Screen Menu Overlay */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(10, 12, 16, 0.98)', backdropFilter: 'blur(30px)',
        zIndex: 101, display: 'flex', flexDirection: 'column',
        padding: '100px 24px 40px', overflowY: 'auto',
        opacity: isMobileMenuOpen ? 1 : 0, pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-20px)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <TabButton active={activeTab === 'overview'} icon={Info} label="Overview" isMobile onClick={() => setActiveTab('overview')} />
          <TabButton active={activeTab === 'renders'} icon={ImageIcon} label="Renders" isMobile onClick={() => setActiveTab('renders')} />
          <TabButton active={activeTab === 'cinematics'} icon={Video} label="Videos" isMobile onClick={() => setActiveTab('cinematics')} />
          <TabButton active={activeTab === 'floorplans'} icon={Layers} label="Floorplans" isMobile onClick={() => setActiveTab('floorplans')} />
          <TabButton active={activeTab === 'availability'} icon={ListChecks} label="Availability" isMobile onClick={() => setActiveTab('availability')} />
          <TabButton active={activeTab === 'map'} icon={Map} label="Location" isMobile onClick={() => setActiveTab('map')} />
          <TabButton active={activeTab === 'panorama'} icon={Hexagon} label="360° Tours" isMobile onClick={() => setActiveTab('panorama')} />
          <TabButton active={activeTab === '3d'} icon={Component} label="3D Interactive" isMobile onClick={() => setActiveTab('3d')} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '32px' }}>
          <button 
            onClick={() => { setIsShareModalOpen(true); setIsMobileMenuOpen(false); }}
            className="glass-panel" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            <Share2 size={24} /> Share
          </button>

          {isAdmin && (
            <button 
              onClick={() => setActiveTab('manage')}
              className="glass-panel" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', borderRadius: '16px', background: activeTab === 'manage' ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)', border: activeTab === 'manage' ? 'none' : '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
              <Settings size={24} /> Manage
            </button>
          )}
        </div>
      </div>

      {/* Main Content Viewport */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        {activeTab === 'overview' && <ProjectOverview onNavigate={setActiveTab} />}
        {activeTab === 'cinematics' && <CinematicsTab />}
        {activeTab === 'renders' && <RendersGallery />}
        {activeTab === 'floorplans' && <FloorplanViewer />}
        {activeTab === 'availability' && <AvailabilityTab onNavigate={setActiveTab} />}
        {activeTab === 'map' && <ProjectMap />}
        {activeTab === 'panorama' && <PanoramaViewer />}
        {activeTab === 'manage' && isAdmin && <AssetManager />}
        
        {/* We reuse the StandaloneView for the 3D portion since it has the Sidebars built-in.
            It uses lazy execution naturally by mounting the Canvas only when this tab is selected! */}
        {activeTab === '3d' && (
          isMobileDevice ? (
            <MobileARView isEmbedded={true} />
          ) : (
            <Suspense fallback={<div style={{color:'white', padding: 50}}>Loading WebGL Engine...</div>}>
              <StandaloneView isNested={true} />
            </Suspense>
          )
        )}
      </div>

      {/* Global Footer Watermark */}
      <div style={{
        position: 'absolute', bottom: '32px', left: '32px', zIndex: 100,
        pointerEvents: 'auto', display: 'flex', alignItems: 'center'
      }}>
        <a 
          href="https://progressivetechnologies.com.cy/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            color: 'rgba(255,255,255,0.4)', fontSize: '12px', textDecoration: 'none',
            fontFamily: 'Outfit, sans-serif', letterSpacing: '0.5px', transition: 'color 0.2s ease',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)'
          }}
          onMouseEnter={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}
        >
          Developed by <strong>Progressive Technologies</strong>
        </a>
      </div>

      {activeTab !== 'standalone' && <FloatingConcierge />}
      {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} />}
    </div>
  );
}

// Vercel webhook trigger
