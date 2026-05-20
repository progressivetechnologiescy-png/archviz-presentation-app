import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Layers, Image as ImageIcon, Settings, Share2, Menu, X, Maximize, Eye, Volume2, VolumeX, Play, Pause, Music, SkipForward, SkipBack, ChevronDown, ChevronUp, Compass, PlayCircle, Building, MapPin, Orbit, Gamepad2, Sliders, Hexagon, Sun, SunDim, Moon } from 'lucide-react';
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
      ref={props.btnRef}
      className="nav-tab-btn"
      onClick={props.onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', cursor: 'pointer', borderRadius: '12px',
        // Transparent in desktop mode so the absolute sliding capsule shows through.
        background: props.isMobile 
          ? (props.active ? 'var(--accent-color)' : (isHovered ? 'rgba(255,255,255,0.1)' : 'transparent'))
          : (props.active ? 'transparent' : (isHovered ? 'rgba(255,255,255,0.06)' : 'transparent')),
        border: 'none',
        color: 'white',
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)', fontWeight: '600',
        boxShadow: (props.isMobile && props.active) ? '0 4px 12px var(--accent-glow)' : 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        opacity: props.active ? 1 : (isHovered ? 1 : 0.85),
        padding: props.isMobile ? '16px 24px' : undefined,
        width: props.isMobile ? '100%' : 'auto',
        justifyContent: props.isMobile ? 'flex-start' : 'center',
        fontSize: props.isMobile ? '18px' : undefined,
        gap: props.isMobile ? '16px' : '8px',
        zIndex: props.isMobile ? undefined : 2,
        position: props.isMobile ? undefined : 'relative',
        transform: isHovered && !props.active ? 'translateY(-1px)' : 'none'
      }}
    >
      <IconToRender 
        className="nav-tab-icon" 
        style={{
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.15) rotate(3deg)' : 'scale(1)',
          color: props.active ? 'white' : (isHovered ? 'var(--accent-color)' : 'rgba(255,255,255,0.8)'),
          ...(props.isMobile ? { width: '24px', height: '24px', display: 'block' } : {})
        }} 
      /> 
      <span className="nav-tab-label" style={{
        transition: 'color 0.2s ease',
        color: props.active ? 'white' : (isHovered ? 'white' : 'rgba(255,255,255,0.85)')
      }}>{props.label}</span>
    </button>
  );
};

function AmbientSoundPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.25);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showTrackList, setShowTrackList] = useState(false);
  const audioRef = useRef(null);
  const containerRef = useRef(null);

  const TRACKS = [
    {
      name: 'Mediterranean Chill',
      genre: 'Lounge',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
    },
    {
      name: 'Ocean Breeze',
      genre: 'Lo-Fi Ambient',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    {
      name: 'Luxury Oasis',
      genre: 'Deep House',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    },
    {
      name: 'Modern Minimalist',
      genre: 'Tech Ambient',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
    },
    {
      name: 'Serene Classical',
      genre: 'Piano Solo',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3'
    }
  ];

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    audioRef.current = new Audio(currentTrack.url);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowTrackList(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const changeTrack = (index) => {
    if (!audioRef.current) return;
    const wasPlaying = isPlaying;
    audioRef.current.pause();
    
    setCurrentTrackIndex(index);
    audioRef.current.src = TRACKS[index].url;
    audioRef.current.load();
    
    if (wasPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Playback prevented:", err);
        setIsPlaying(false);
      });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Autoplay blocked by browser:", err);
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const nextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % TRACKS.length;
    changeTrack(nextIdx);
  };

  const prevTrack = () => {
    const prevIdx = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    changeTrack(prevIdx);
  };

  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
      style={{
        position: 'absolute',
        bottom: '68px',
        left: '32px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 18px',
        borderRadius: '20px',
        background: 'rgba(10, 12, 16, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        color: 'white',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        fontFamily: 'Outfit, sans-serif'
      }}
    >
      <style>{`
        @keyframes floatBar1 { 0%, 100% { height: 4px; } 50% { height: 16px; } }
        @keyframes floatBar2 { 0%, 100% { height: 6px; } 50% { height: 22px; } }
        @keyframes floatBar3 { 0%, 100% { height: 8px; } 50% { height: 18px; } }
        @keyframes floatBar4 { 0%, 100% { height: 5px; } 50% { height: 12px; } }
        .visualizer-bar {
          width: 3px;
          background: var(--accent-color);
          border-radius: 2px;
          transition: height 0.3s ease;
        }
      `}</style>

      {/* Track List Dropdown Overlay */}
      {showTrackList && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 12px)',
          left: 0,
          width: '240px',
          background: 'rgba(10, 12, 16, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 101,
          animation: 'chatEntrance 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}>
          <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)', padding: '0 8px 4px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            SELECT SOUND GENRE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '180px', overflowY: 'auto' }} className="chat-scrollbar">
            {TRACKS.map((track, idx) => {
              const isCurrent = idx === currentTrackIndex;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    changeTrack(idx);
                    setShowTrackList(false);
                  }}
                  style={{
                    background: isCurrent ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: isCurrent ? 'var(--accent-color)' : 'white',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{track.name}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: '500' }}>{track.genre}</span>
                  </div>
                  {isCurrent && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 8px var(--accent-glow)' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Audio Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          onClick={prevTrack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        >
          <SkipBack size={14} />
        </button>

        <button 
          onClick={togglePlay}
          style={{
            background: isPlaying ? 'rgba(255,255,255,0.08)' : 'var(--accent-color)',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            boxShadow: isPlaying ? 'none' : '0 4px 12px var(--accent-glow)',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
        >
          {isPlaying ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" style={{ marginLeft: '2px' }} />}
        </button>

        <button 
          onClick={nextTrack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
        >
          <SkipForward size={14} />
        </button>
      </div>

      {/* Track Info & Visualizer */}
      <div 
        onClick={() => setShowTrackList(!showTrackList)}
        style={{ display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer', userSelect: 'none' }}
      >
        <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {currentTrack.genre} <ChevronDown size={10} style={{ transform: showTrackList ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'white' }}>
            {currentTrack.name}
          </span>
          
          {/* Visualizer bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '16px', width: '20px' }}>
            <div className="visualizer-bar" style={{
              height: isPlaying ? undefined : '3px',
              animation: isPlaying ? 'floatBar1 1.2s infinite ease-in-out' : 'none'
            }} />
            <div className="visualizer-bar" style={{
              height: isPlaying ? undefined : '5px',
              animation: isPlaying ? 'floatBar2 0.8s infinite ease-in-out' : 'none'
            }} />
            <div className="visualizer-bar" style={{
              height: isPlaying ? undefined : '6px',
              animation: isPlaying ? 'floatBar3 1.0s infinite ease-in-out' : 'none'
            }} />
            <div className="visualizer-bar" style={{
              height: isPlaying ? undefined : '3px',
              animation: isPlaying ? 'floatBar4 0.7s infinite ease-in-out' : 'none'
            }} />
          </div>
        </div>
      </div>

      {/* Volume Controls (revealed on hover) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: showVolume ? '100px' : '0px',
        opacity: showVolume ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        paddingLeft: showVolume ? '8px' : '0px',
        borderLeft: showVolume ? '1px solid rgba(255,255,255,0.1)' : 'none'
      }}>
        <button 
          onClick={toggleMute}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input 
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            setIsMuted(false);
          }}
          style={{
            width: '60px',
            height: '4px',
            WebkitAppearance: 'none',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '2px',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
}

export default function PresentationApp({ forceAdmin = false }) {
  const fetchCloudAssets = useViewerStore(state => state.fetchCloudAssets);
  const isLightboxOpen = useViewerStore(state => state.isLightboxOpen);
  const isGlobalScrolled = useViewerStore(state => state.isGlobalScrolled);
  const projectTitle = useViewerStore(state => state.projectTitle);
  const companyName = useViewerStore(state => state.companyName);
  const logoUrl = useViewerStore(state => state.logoUrl);
  const mapMode = useViewerStore(state => state.mapMode);
    
  const [isAdmin] = useState(() => {
    if (forceAdmin) return true;
    const params = new URLSearchParams(window.location.search);
    return params.get('admin') === 'true';
  });
  const themeMode = useViewerStore(state => state.themeMode);
  const accentColor = useViewerStore(state => state.accentColor);
  const lightingPreset = useViewerStore(state => state.lightingPreset);
  const updateBrandingConfig = useViewerStore(state => state.updateBrandingConfig);
  const menuPosition = useViewerStore(state => state.menuPosition) || 'top';
  const setMenuPosition = useViewerStore(state => state.setMenuPosition);
  
  const [activeTab, setActiveTab] = useState(isAdmin ? 'manage' : 'overview');
  const currentMapMode = mapMode || themeMode || 'dark';
  const isDarkBackgroundTab = ['overview', '3d', 'panorama'].includes(activeTab) || (activeTab === 'map' && currentMapMode === 'dark');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(window.innerWidth <= 1100);
  const [showVibeWidget, setShowVibeWidget] = useState(false);

  const [activeRect, setActiveRect] = useState({ left: 0, width: 0 });
  const buttonRefs = useRef({});
  const vibeContainerRef = useRef(null);

  // Close environment vibe customizer dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (vibeContainerRef.current && !vibeContainerRef.current.contains(e.target)) {
        setShowVibeWidget(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Sync active tab background slide position on tab change and window resize
  useEffect(() => {
    const updateActiveRect = () => {
      const activeBtn = buttonRefs.current[activeTab];
      if (activeBtn) {
        setActiveRect({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth
        });
      }
    };
    
    // Tiny delay to ensure styles/fonts are calculated
    const timer = setTimeout(updateActiveRect, 50);
    window.addEventListener('resize', updateActiveRect);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateActiveRect);
    };
  }, [activeTab, menuPosition]);

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
      
      {/* Global Responsive Floating Header Canopy */}
      <div style={{
        position: 'absolute', 
        top: '16px', 
        left: '16px', 
        right: '16px', 
        zIndex: 100,
        padding: (!isMobileDevice && menuPosition === 'bottom') ? '0' : '12px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'nowrap', 
        gap: '20px',
        background: (!isMobileDevice && menuPosition === 'bottom') 
          ? 'transparent' 
          : (isGlobalScrolled || isMobileMenuOpen ? 'rgba(10, 12, 16, 0.85)' : 'rgba(10, 12, 16, 0.65)'), 
        backdropFilter: (!isMobileDevice && menuPosition === 'bottom') ? 'none' : 'blur(24px)',
        WebkitBackdropFilter: (!isMobileDevice && menuPosition === 'bottom') ? 'none' : 'blur(24px)', 
        border: (!isMobileDevice && menuPosition === 'bottom') ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        boxShadow: (!isMobileDevice && menuPosition === 'bottom') ? 'none' : '0 12px 40px rgba(0, 0, 0, 0.45)',
        opacity: isLightboxOpen ? 0 : 1, 
        pointerEvents: isLightboxOpen ? 'none' : 'auto', 
        transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        transform: isLightboxOpen ? 'translateY(-30px)' : 'translateY(0)'
      }}>
        <style>{`
          .nav-tab-btn { padding: 10px 20px; font-size: 14px; gap: 8px; }
          .nav-tab-icon { width: 16px; height: 16px; }
          
          .liquid-capsule {
            position: absolute;
            top: 6px;
            bottom: 6px;
            left: 0;
            background: linear-gradient(135deg, var(--accent-color), var(--accent-glow, #3b82f6));
            border-radius: 12px;
            box-shadow: 0 4px 18px var(--accent-glow), inset 0 1px 0 rgba(255, 255, 255, 0.2);
            z-index: 1;
            pointer-events: none;
            overflow: hidden;
          }
          
          .liquid-capsule::after {
            content: '';
            position: absolute;
            top: 0;
            left: -150%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.25),
              transparent
            );
            transform: skewX(-20deg);
            animation: tabShimmer 4s infinite ease-in-out;
          }
          
          @keyframes tabShimmer {
            0% { left: -150%; }
            30% { left: 150%; }
            100% { left: 150%; }
          }

          @keyframes vibeEntrance {
            0% { opacity: 0; transform: translateY(10px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          
          @media (max-width: 1500px) {
            .nav-tab-btn { padding: 8px 12px; font-size: 13px; gap: 4px; }
            .nav-tab-icon { width: 14px; height: 14px; }
            .action-text { display: none !important; }
            .header-actions-container button { padding: 12px !important; border-radius: 50% !important; width: 44px; height: 44px; justify-content: center; }
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
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          flexShrink: 0, 
          pointerEvents: 'none', 
          zIndex: 102,
          ...((!isMobileDevice && menuPosition === 'bottom') ? {
            background: isGlobalScrolled ? 'rgba(10, 12, 16, 0.85)' : 'rgba(10, 12, 16, 0.65)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '8px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
            pointerEvents: 'auto'
          } : {})
        }}>
          <div style={{ 
            width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--accent-color), #60a5fa)', 
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px var(--accent-glow), 0 2px 8px rgba(0,0,0,0.4)', overflow: 'hidden'
          }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'rgba(255,255,255,0.9)' }} />
            ) : (
              <Hexagon size={22} color="#fff" style={{ margin: 'auto' }} />
            )}
          </div>
          <div className="desktop-logo-text">
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', letterSpacing: '0.5px', textShadow: !isDarkBackgroundTab ? 'none' : '0 2px 12px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', color: !isDarkBackgroundTab ? 'var(--text-primary)' : 'white' }}>{projectTitle}</h1>
            <p style={{ margin: '1px 0 0', color: !isDarkBackgroundTab ? 'var(--text-secondary)' : 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textShadow: !isDarkBackgroundTab ? 'none' : '0 1px 8px rgba(0,0,0,0.9)', whiteSpace: 'nowrap' }}>{companyName}</p>
          </div>
        </div>
 
        {/* Desktop Navigation Pill */}
        {activeTab !== 'manage' && (menuPosition === 'top' || isMobileDevice) ? (
          <div className="desktop-nav" style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
            <div className="glass-panel" style={{ 
              position: 'relative',
              display: 'flex', gap: '4px', padding: '6px', borderRadius: '16px',
              background: 'rgba(10, 12, 16, 0.8)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}>
              {/* Liquid Sliding Background Capsule */}
              {activeRect.width > 0 && (
                <div 
                  className="liquid-capsule"
                  style={{
                    width: `${activeRect.width}px`,
                    transform: `translateX(${activeRect.left}px)`,
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                />
              )}
              
              <TabButton btnRef={el => buttonRefs.current['overview'] = el} active={activeTab === 'overview'} icon={Compass} label="Overview" onClick={() => setActiveTab('overview')} />
              <TabButton btnRef={el => buttonRefs.current['renders'] = el} active={activeTab === 'renders'} icon={ImageIcon} label="Renders" onClick={() => setActiveTab('renders')} />
              <TabButton btnRef={el => buttonRefs.current['cinematics'] = el} active={activeTab === 'cinematics'} icon={PlayCircle} label="Videos" onClick={() => setActiveTab('cinematics')} />
              <TabButton btnRef={el => buttonRefs.current['floorplans'] = el} active={activeTab === 'floorplans'} icon={Layers} label="Floorplans" onClick={() => setActiveTab('floorplans')} />
              <TabButton btnRef={el => buttonRefs.current['availability'] = el} active={activeTab === 'availability'} icon={Building} label="Availability" onClick={() => setActiveTab('availability')} />
              <TabButton btnRef={el => buttonRefs.current['map'] = el} active={activeTab === 'map'} icon={MapPin} label="Location" onClick={() => setActiveTab('map')} />
              <TabButton btnRef={el => buttonRefs.current['panorama'] = el} active={activeTab === 'panorama'} icon={Orbit} label="360° Tours" onClick={() => setActiveTab('panorama')} />
              <TabButton btnRef={el => buttonRefs.current['3d'] = el} active={activeTab === '3d'} icon={Gamepad2} label="3D Interactive" onClick={() => setActiveTab('3d')} />
            </div>
          </div>
        ) : (
          <div className="desktop-nav" style={{ flex: 1 }} /> /* Empty spacer when in manage mode or bottom dock mode */
        )}

        {/* Desktop Global Controls */}
        <div className="header-actions-container" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          zIndex: 102, 
          flexShrink: 0,
          ...((!isMobileDevice && menuPosition === 'bottom') ? {
            background: isGlobalScrolled ? 'rgba(10, 12, 16, 0.85)' : 'rgba(10, 12, 16, 0.65)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '6px 10px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)'
          } : {})
        }}>
          
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
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '30px', background: activeTab === 'manage' ? 'var(--input-bg)' : 'var(--accent-color)', cursor: 'pointer', border: activeTab === 'manage' ? '1px solid var(--border-color)' : '1px solid rgba(255,255,255,0.1)', color: activeTab === 'manage' ? 'var(--text-primary)' : 'white', fontWeight: 'bold' }}>
              {activeTab === 'manage' ? <Eye size={16} /> : <Settings size={16} />}
              <span className="action-text">{activeTab === 'manage' ? 'View App' : 'Manage'}</span>
            </button>
          )}

          {/* Vibe Settings Widget (Hidden on Manage) */}
          {activeTab !== 'manage' && (
            <div ref={vibeContainerRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowVibeWidget(!showVibeWidget)}
                className="glass-panel hover-lift icon-action-btn" 
                title="Environment Customizer"
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  width: '44px', height: '44px', padding: '0', 
                  borderRadius: '50%', 
                  background: showVibeWidget ? 'var(--accent-color)' : 'rgba(10, 12, 16, 0.8)', 
                  cursor: 'pointer', 
                  border: showVibeWidget ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)', 
                  color: 'white',
                  boxShadow: showVibeWidget ? '0 4px 14px var(--accent-glow)' : 'none',
                  transition: 'all 0.2s ease'
                }}>
                <Sliders size={18} />
              </button>

              {showVibeWidget && (
                <div 
                  className="vibe-dropdown-panel"
                  style={{
                    position: 'absolute',
                    top: '56px',
                    right: 0,
                    width: '300px',
                    background: 'rgba(10, 12, 16, 0.92)',
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
                    borderRadius: '20px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    zIndex: 105,
                    animation: 'vibeEntrance 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                  }}
                >
                  {/* Dropdown Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sliders size={15} color="var(--accent-color)" />
                      <span style={{ fontWeight: '800', fontSize: '13px', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'white' }}>Ambiance & Style</span>
                    </div>
                    <button 
                      onClick={() => setShowVibeWidget(false)}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* 1. Ambiance / Lighting Preset Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>Lighting Ambiance</span>
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {[
                        { id: 'morning', label: 'Dawn', icon: Sun },
                        { id: 'noon', label: 'Daylight', icon: SunDim },
                        { id: 'night', label: 'Sunset', icon: Moon }
                      ].map(preset => {
                        const IconComponent = preset.icon;
                        const isSelected = lightingPreset === preset.id;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => updateBrandingConfig(supabase, { lightingPreset: preset.id })}
                            style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 4px',
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              background: isSelected ? 'var(--accent-color)' : 'transparent',
                              color: isSelected ? 'white' : 'rgba(255,255,255,0.7)',
                              boxShadow: isSelected ? '0 4px 10px var(--accent-glow)' : 'none',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <IconComponent size={14} />
                            <span style={{ fontSize: '9px', fontWeight: '700' }}>{preset.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Color Theme Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>Theme Style</span>
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {[
                        { id: 'dark', label: 'Midnight Dark' },
                        { id: 'light', label: 'Classic Light' }
                      ].map(themeOpt => {
                        const isSelected = themeMode === themeOpt.id;
                        return (
                          <button
                            key={themeOpt.id}
                            onClick={() => updateBrandingConfig(supabase, { themeMode: themeOpt.id })}
                            style={{
                              flex: 1,
                              padding: '6px 4px',
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              background: isSelected ? 'var(--accent-color)' : 'transparent',
                              color: isSelected ? 'white' : 'rgba(255,255,255,0.7)',
                              boxShadow: isSelected ? '0 4px 10px var(--accent-glow)' : 'none',
                              fontSize: '10px',
                              fontWeight: '700',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {themeOpt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Accent Color Picker */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>Luxury Accent Swatches</span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', padding: '2px 0' }}>
                      {[
                        { value: '#3b82f6', label: 'Ocean Blue' },
                        { value: '#10b981', label: 'Cyprus Emerald' },
                        { value: '#f59e0b', label: 'Sunset Amber' },
                        { value: '#ec4899', label: 'Rose Gold' },
                        { value: '#8b5cf6', label: 'Royal Violet' }
                      ].map(colorSwatch => {
                        const isSelected = accentColor === colorSwatch.value;
                        return (
                          <button
                            key={colorSwatch.value}
                            onClick={() => updateBrandingConfig(supabase, { accentColor: colorSwatch.value })}
                            title={colorSwatch.label}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: colorSwatch.value,
                              border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                              cursor: 'pointer',
                              boxShadow: isSelected ? `0 0 10px ${colorSwatch.value}` : 'none',
                              transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Menu Layout Position Toggler */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>Menu Layout (Rollback Option)</span>
                    <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {[
                        { id: 'top', label: 'Top Canopy' },
                        { id: 'bottom', label: 'Bottom Dock' }
                      ].map(layoutOpt => {
                        const isSelected = menuPosition === layoutOpt.id;
                        return (
                          <button
                            key={layoutOpt.id}
                            onClick={() => setMenuPosition(layoutOpt.id)}
                            style={{
                              flex: 1,
                              padding: '6px 4px',
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              background: isSelected ? 'var(--accent-color)' : 'transparent',
                              color: isSelected ? 'white' : 'rgba(255,255,255,0.7)',
                              boxShadow: isSelected ? '0 4px 10px var(--accent-glow)' : 'none',
                              fontSize: '10px',
                              fontWeight: '700',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {layoutOpt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
              width: '44px', height: '44px', padding: '0', 
              borderRadius: '50%', background: 'rgba(10, 12, 16, 0.8)', cursor: 'pointer', 
              border: activeTab === 'manage' ? '1px solid var(--border-color)' : '1px solid rgba(255,255,255,0.1)', color: activeTab === 'manage' ? 'var(--text-primary)' : 'white' 
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
                width: '44px', height: '44px', padding: '0', 
                borderRadius: '50%', background: 'rgba(10, 12, 16, 0.8)', cursor: 'pointer', 
                border: activeTab === 'manage' ? '1px solid var(--border-color)' : '1px solid rgba(255,255,255,0.1)', color: activeTab === 'manage' ? 'var(--text-primary)' : 'white' 
              }}>
              <Share2 size={18} />
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button 
            className="mobile-nav-toggle glass-panel icon-action-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ 
              width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(10, 12, 16, 0.8)', 
              border: activeTab === 'manage' ? '1px solid var(--border-color)' : '1px solid rgba(255,255,255,0.1)', color: activeTab === 'manage' ? 'var(--text-primary)' : 'white', cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
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
          <TabButton active={activeTab === 'overview'} icon={Compass} label="Overview" isMobile onClick={() => setActiveTab('overview')} />
          <TabButton active={activeTab === 'renders'} icon={ImageIcon} label="Renders" isMobile onClick={() => setActiveTab('renders')} />
          <TabButton active={activeTab === 'cinematics'} icon={PlayCircle} label="Videos" isMobile onClick={() => setActiveTab('cinematics')} />
          <TabButton active={activeTab === 'floorplans'} icon={Layers} label="Floorplans" isMobile onClick={() => setActiveTab('floorplans')} />
          <TabButton active={activeTab === 'availability'} icon={Building} label="Availability" isMobile onClick={() => setActiveTab('availability')} />
          <TabButton active={activeTab === 'map'} icon={MapPin} label="Location" isMobile onClick={() => setActiveTab('map')} />
          <TabButton active={activeTab === 'panorama'} icon={Orbit} label="360° Tours" isMobile onClick={() => setActiveTab('panorama')} />
          <TabButton active={activeTab === '3d'} icon={Gamepad2} label="3D Interactive" isMobile onClick={() => setActiveTab('3d')} />
        </div>
        
        {/* Mobile Vibe & Style Customizer inside Menu Overlay */}
        {activeTab !== 'manage' && (
          <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="var(--accent-color)" />
              <span style={{ fontWeight: '700', fontSize: '14px', color: 'white' }}>AMBANCE & ACCENT</span>
            </div>
            
            {/* Lighting presets */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
              {[
                { id: 'morning', label: 'Dawn', icon: Sun },
                { id: 'noon', label: 'Daylight', icon: SunDim },
                { id: 'night', label: 'Sunset', icon: Moon }
              ].map(preset => {
                const IconComponent = preset.icon;
                const isSelected = lightingPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => updateBrandingConfig(supabase, { lightingPreset: preset.id })}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 4px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      background: isSelected ? 'var(--accent-color)' : 'transparent', color: isSelected ? 'white' : 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600'
                    }}
                  >
                    <IconComponent size={14} /> {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Accent swatch color rings */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', padding: '4px 0' }}>
              {[
                { value: '#3b82f6', label: 'Ocean Blue' },
                { value: '#10b981', label: 'Cyprus Emerald' },
                { value: '#f59e0b', label: 'Sunset Amber' },
                { value: '#ec4899', label: 'Rose Gold' },
                { value: '#8b5cf6', label: 'Royal Violet' }
              ].map(colorSwatch => {
                const isSelected = accentColor === colorSwatch.value;
                return (
                  <button
                    key={colorSwatch.value}
                    onClick={() => updateBrandingConfig(supabase, { accentColor: colorSwatch.value })}
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%', background: colorSwatch.value,
                      border: isSelected ? '3px solid white' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s'
                    }}
                  />
                );
              })}
            </div>

            {/* Menu Layout Toggler */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>Menu Layout (Desktop Dock Switcher)</span>
              <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
                {[
                  { id: 'top', label: 'Top Canopy' },
                  { id: 'bottom', label: 'Bottom Dock' }
                ].map(layoutOpt => {
                  const isSelected = menuPosition === layoutOpt.id;
                  return (
                    <button
                      key={layoutOpt.id}
                      onClick={() => setMenuPosition(layoutOpt.id)}
                      style={{
                        flex: 1, padding: '8px 4px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                        background: isSelected ? 'var(--accent-color)' : 'transparent', color: isSelected ? 'white' : 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: '600'
                      }}
                    >
                      {layoutOpt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          <button 
            onClick={() => { setIsShareModalOpen(true); setIsMobileMenuOpen(false); }}
            className="glass-panel" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: activeTab === 'manage' ? '1px solid var(--border-color)' : '1px solid rgba(255,255,255,0.1)', color: activeTab === 'manage' ? 'var(--text-primary)' : 'white', fontWeight: 'bold', fontSize: '18px' }}>
            <Share2 size={24} /> Share
          </button>

          {isAdmin && (
            <button 
              onClick={() => { setActiveTab('manage'); setIsMobileMenuOpen(false); }}
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
        
        {/* Keep RendersGallery mounted to prevent reloading images every time the user visits this tab */}
        <div style={{ display: activeTab === 'renders' ? 'block' : 'none', width: '100%', height: '100%' }}>
          <RendersGallery />
        </div>
        
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

      {/* Premium ambient soundtrack player loop */}
      {activeTab !== 'manage' && <AmbientSoundPlayer />}

      {/* Centered Bottom Floating Glass Dock */}
      {activeTab !== 'manage' && menuPosition === 'bottom' && !isMobileDevice && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          minWidth: 0,
          animation: 'vibeEntrance 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          opacity: isLightboxOpen ? 0 : 1,
          pointerEvents: isLightboxOpen ? 'none' : 'auto',
          transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
        }}>
          <div className="glass-panel" style={{ 
            position: 'relative',
            display: 'flex', gap: '4px', padding: '6px', borderRadius: '16px',
            background: 'rgba(10, 12, 16, 0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.65)',
            transform: 'translateZ(0)'
          }}>
            {/* Liquid Sliding Background Capsule */}
            {activeRect.width > 0 && (
              <div 
                className="liquid-capsule"
                style={{
                  width: `${activeRect.width}px`,
                  transform: `translateX(${activeRect.left}px)`,
                  transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              />
            )}
            
            <TabButton btnRef={el => buttonRefs.current['overview'] = el} active={activeTab === 'overview'} icon={Compass} label="Overview" onClick={() => setActiveTab('overview')} />
            <TabButton btnRef={el => buttonRefs.current['renders'] = el} active={activeTab === 'renders'} icon={ImageIcon} label="Renders" onClick={() => setActiveTab('renders')} />
            <TabButton btnRef={el => buttonRefs.current['cinematics'] = el} active={activeTab === 'cinematics'} icon={PlayCircle} label="Videos" onClick={() => setActiveTab('cinematics')} />
            <TabButton btnRef={el => buttonRefs.current['floorplans'] = el} active={activeTab === 'floorplans'} icon={Layers} label="Floorplans" onClick={() => setActiveTab('floorplans')} />
            <TabButton btnRef={el => buttonRefs.current['availability'] = el} active={activeTab === 'availability'} icon={Building} label="Availability" onClick={() => setActiveTab('availability')} />
            <TabButton btnRef={el => buttonRefs.current['map'] = el} active={activeTab === 'map'} icon={MapPin} label="Location" onClick={() => setActiveTab('map')} />
            <TabButton btnRef={el => buttonRefs.current['panorama'] = el} active={activeTab === 'panorama'} icon={Orbit} label="360° Tours" onClick={() => setActiveTab('panorama')} />
            <TabButton btnRef={el => buttonRefs.current['3d'] = el} active={activeTab === '3d'} icon={Gamepad2} label="3D Interactive" onClick={() => setActiveTab('3d')} />
          </div>
        </div>
      )}

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

