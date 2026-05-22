import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Layers, Image as ImageIcon, Map, Hexagon, Component, Settings, Info, ListChecks, Share2, Video, Menu, X, Maximize, Eye, Volume2, VolumeX, Play, Pause, Music, SkipForward, SkipBack, ChevronDown, ChevronUp, Minimize2 } from 'lucide-react';
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
import SpatialCard from '../components/SpatialCard';

const TabButton = ({ btnRef, active, icon, label, onClick, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const IconToRender = icon;
  return (
    <button 
      ref={btnRef}
      className="nav-tab-btn"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', cursor: 'pointer', borderRadius: '12px',
        // Transparent in desktop mode so the absolute sliding capsule shows through.
        background: isMobile 
          ? (active ? 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' : (isHovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent'))
          : (active ? 'transparent' : (isHovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent')),
        border: 'none',
        color: active 
          ? '#ffffff' 
          : (isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.75)'),
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)', fontWeight: '700',
        boxShadow: (isMobile && active) ? '0 8px 24px rgba(59, 130, 246, 0.35)' : 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        opacity: 1,
        padding: isMobile ? '12px 16px' : undefined,
        width: isMobile ? '100%' : 'auto',
        justifyContent: isMobile ? 'flex-start' : 'center',
        fontSize: isMobile ? '14px' : undefined,
        gap: isMobile ? '10px' : undefined,
        zIndex: isMobile ? undefined : 2,
        position: isMobile ? undefined : 'relative'
      }}
    >
      <IconToRender 
        className="nav-tab-icon" 
        style={{
          width: isMobile ? '18px' : '16px',
          height: isMobile ? '18px' : '16px',
          display: isMobile ? 'block' : 'inline-block',
          color: active 
            ? '#ffffff' 
            : (isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.75)'),
          transition: 'color 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }} 
      /> 
      <span 
        className="nav-tab-label"
        style={{
          color: active 
            ? '#ffffff' 
            : (isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.75)'),
          transition: 'color 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        {label}
      </span>
    </button>
  );
};

function AmbientSoundPlayer({ isMobileDrawer = false, activeTab = 'overview' }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const controlMode = useViewerStore(state => state.controlMode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [isMuted, setIsMuted] = useState(false);
  const [showTrackList, setShowTrackList] = useState(false);
  const audioRef = useRef(null);
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(isMobileDrawer || window.innerWidth <= 1100);
  const [isTouchDevice] = useState(() => typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)));
  const [isMinimized, setIsMinimized] = useState(isMobileDrawer ? false : true);
  const [isPlayHovered, setIsPlayHovered] = useState(false);

  useEffect(() => {
    if (isMobileDrawer) {
      return;
    }
    const handleResize = () => setIsMobile(window.innerWidth <= 1100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileDrawer]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <>
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <SpatialCard 
        ref={containerRef}
        className="dark-obsidian-panel"
        onMouseEnter={() => {
          if (!isMobileDrawer) {
            setIsMinimized(false);
          }
        }}
        onMouseLeave={() => {
          if (!isMobileDrawer) {
            setIsMinimized(true);
            setShowTrackList(false);
          }
        }}
        onClick={() => {
          if (isMinimized) {
            setIsMinimized(false);
          }
        }}
        style={{
          position: isMobileDrawer ? 'relative' : 'absolute',
          bottom: isMobileDrawer ? 'auto' : (isMobile ? 'auto' : (activeTab === '3d' && controlMode === 'walk' && isTouchDevice ? '250px' : '68px')),
          top: isMobileDrawer ? 'auto' : (isMobile ? '96px' : 'auto'),
          left: isMobileDrawer ? 'auto' : (isMobile ? '16px' : '32px'),
          right: isMobileDrawer ? 'auto' : (isMobile ? '16px' : 'auto'),
          width: isMinimized ? '54px' : (isMobileDrawer ? '100%' : (isMobile ? 'calc(100% - 32px)' : '380px')),
          maxWidth: isMobileDrawer ? '320px' : 'none',
          height: isMinimized ? '54px' : (isMobileDrawer ? 'auto' : '58px'),
          borderRadius: isMinimized ? '27px' : (isMobileDrawer ? '24px' : '29px'),
          padding: isMinimized ? '0' : (isMobileDrawer ? '12px' : '6px 16px'),
          margin: isMobileDrawer ? '0 auto' : '0',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: isMinimized ? 'center' : 'flex-start',
          gap: isMinimized ? '0px' : '12px',
          overflow: isMinimized ? 'hidden' : 'visible',
          cursor: isMinimized ? 'pointer' : 'default',
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          fontFamily: 'Outfit, sans-serif',
          border: '1px solid rgba(255, 255, 255, 0.16)'
        }}
      >

      {/* Rotating Music Disc Icon (Leftmost Artwork) - Static disc shell to prevent border/shadow spin wobble */}
      <div 
        onClick={() => !isMinimized && setShowTrackList(!showTrackList)}
        style={{ 
          width: '34px', 
          height: '34px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.18) 100%)', 
          border: '1px solid rgba(255, 255, 255, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          boxShadow: isPlaying ? '0 0 12px var(--accent-glow)' : 'none'
        }}
      >
        {/* Nested spinning container for perfect rotation centering with zero wobble */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          animation: isPlaying ? 'spin 6s linear infinite' : 'none'
        }}>
          <Music size={16} color={isPlaying ? "var(--accent-color)" : "rgba(255,255,255,0.75)"} style={{ filter: isPlaying ? "drop-shadow(0 0 4px var(--accent-glow))" : "none" }} />
        </div>
      </div>

      {/* Track List Dropdown Overlay */}
      {showTrackList && !isMinimized && (
        <div style={{
          position: 'absolute',
          bottom: isMobile ? 'auto' : 'calc(100% + 12px)',
          top: isMobile ? 'calc(100% + 8px)' : 'auto',
          left: 0,
          right: 0,
          width: '100%',
          minWidth: '240px',
          background: 'rgba(16, 18, 26, 0.95)',
          backdropFilter: 'blur(30px) saturate(210%)',
          WebkitBackdropFilter: 'blur(30px) saturate(210%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 101,
          animation: 'chatEntrance 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}>
          <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)', padding: '0 8px 4px 8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
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
                    background: isCurrent ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: isCurrent ? 'var(--accent-color)' : '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{track.name}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '500' }}>{track.genre}</span>
                  </div>
                  {isCurrent && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 8px var(--accent-glow)' }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Expanded Controls Panel Wrapper */}
      <div style={{
        display: 'flex',
        flexDirection: isMobileDrawer ? 'column' : 'row',
        alignItems: isMobileDrawer ? 'stretch' : 'center',
        flex: 1,
        minWidth: 0,
        maxWidth: isMinimized ? '0px' : '320px',
        opacity: isMinimized ? 0 : 1,
        transform: isMinimized ? 'translateX(-16px)' : 'translateX(0)',
        pointerEvents: isMinimized ? 'none' : 'auto',
        visibility: isMinimized ? 'hidden' : 'visible',
        whiteSpace: 'nowrap',
        gap: isMobileDrawer ? '8px' : '12px',
        overflow: isMinimized ? 'hidden' : 'visible',
        transition: 'max-width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.25s ease, transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), visibility 0.4s ease'
      }}>
        {/* Row for Track info and control buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flex: 1,
          minWidth: 0,
          gap: '12px'
        }}>
          {/* Title Text metadata */}
          <div 
            onClick={() => setShowTrackList(!showTrackList)}
            style={{ display: 'flex', flexDirection: 'column', minWidth: 0, cursor: 'pointer', userSelect: 'none', flex: 1 }}
          >
            <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              {currentTrack.genre}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', minWidth: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                {currentTrack.name}
                <ChevronDown size={10} style={{ transform: showTrackList ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.6 }} />
              </span>
            </div>
          </div>

          {/* Action Player buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <button 
              onClick={prevTrack}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              <SkipBack size={12} />
            </button>

            <button 
              onClick={togglePlay}
              onMouseEnter={() => setIsPlayHovered(true)}
              onMouseLeave={() => setIsPlayHovered(false)}
              style={{
                background: '#ffffff',
                border: 'none',
                outline: 'none',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0a0c10',
                cursor: 'pointer',
                padding: 0,
                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.25)',
                transform: isPlayHovered ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.2s, color 0.2s, box-shadow 0.2s'
              }}
            >
              {isPlaying ? <Pause size={12} fill="#0a0c10" color="#0a0c10" /> : <Play size={12} fill="#0a0c10" color="#0a0c10" style={{ marginLeft: '1px' }} />}
            </button>

            <button 
              onClick={nextTrack}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
            >
              <SkipForward size={12} />
            </button>
            
            {!isMobileDrawer && (
              <button 
                onClick={() => setIsMinimized(true)}
                title="Minimize soundtrack player"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'rgba(255, 255, 255, 0.45)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  marginLeft: '2px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)'}
              >
                <Minimize2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Visualizer & Inline Volume (Desktop view) */}
        {!isMobileDrawer && (
          <>
            {/* Visualizer bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px', width: '20px', flexShrink: 0 }}>
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
            </div>

            {/* Volume Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '85px',
              paddingLeft: '8px',
              borderLeft: '1px solid rgba(255, 255, 255, 0.14)',
              flexShrink: 0
            }}>
              <button 
                onClick={toggleMute}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255, 255, 255, 0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
              >
                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                style={{ 
                  width: '50px',
                  minWidth: '0',
                  margin: 0,
                  padding: 0,
                  background: `linear-gradient(to right, #ffffff ${((isMuted ? 0 : volume) * 100)}%, rgba(255, 255, 255, 0.35) ${((isMuted ? 0 : volume) * 100)}%)`
                }}
              />
            </div>
          </>
        )}

        {/* Dynamic Responsive Volume row (Mobile view) */}
        {isMobileDrawer && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            marginTop: '4px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button 
              onClick={toggleMute}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'rgba(255, 255, 255, 0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, flexShrink: 0 }}
            >
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              style={{ 
                flex: 1,
                width: '100%',
                minWidth: '0',
                margin: 0,
                padding: 0,
                background: `linear-gradient(to right, #ffffff ${((isMuted ? 0 : volume) * 100)}%, rgba(255, 255, 255, 0.35) ${((isMuted ? 0 : volume) * 100)}%)`
              }}
            />
          </div>
        )}
      </div>
    </SpatialCard>
    </>
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
  const controlMode = useViewerStore(state => state.controlMode);
  
  const [hoveredFullscreen, setHoveredFullscreen] = useState(false);
  const [hoveredShare, setHoveredShare] = useState(false);
  const [hoveredMobileMenu, setHoveredMobileMenu] = useState(false);
    
  const [isAdmin] = useState(() => {
    if (forceAdmin) return true;
    const params = new URLSearchParams(window.location.search);
    return params.get('admin') === 'true';
  });
  const themeMode = useViewerStore(state => state.themeMode);
  const accentColor = useViewerStore(state => state.accentColor);
  
  const [activeTab, setActiveTab] = useState(isAdmin ? 'manage' : 'overview');
  const currentMapMode = mapMode || themeMode || 'dark';
  const isDarkBackgroundTab = ['overview', '3d', 'panorama'].includes(activeTab) || (activeTab === 'map' && currentMapMode === 'dark');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(window.innerWidth <= 1100);
  const [isTouchDevice] = useState(() => typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)));

  const [activeRect, setActiveRect] = useState({ left: 0, width: 0 });
  const buttonRefs = useRef({});

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
  }, [activeTab]);

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
        background: isGlobalScrolled || isMobileMenuOpen ? 'rgba(10, 12, 18, 0.65)' : 'transparent', 
        backdropFilter: isGlobalScrolled || isMobileMenuOpen ? 'blur(30px) saturate(210%)' : 'none', 
        WebkitBackdropFilter: isGlobalScrolled || isMobileMenuOpen ? 'blur(30px) saturate(210%)' : 'none', 
        borderBottom: isGlobalScrolled || isMobileMenuOpen ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid transparent',
        boxShadow: isGlobalScrolled || isMobileMenuOpen ? '0 8px 32px rgba(0, 0, 0, 0.35)' : 'none',
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
            <h1 style={{ 
              margin: 0, fontSize: '22px', fontWeight: '700', letterSpacing: '0.5px', 
              textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)', 
              whiteSpace: 'nowrap', 
              color: 'white',
              transition: 'color 0.3s ease'
            }}>{projectTitle}</h1>
            <p style={{ 
              margin: '2px 0 0', 
              color: 'rgba(255, 255, 255, 0.75)', 
              fontSize: '12px', fontWeight: '600', letterSpacing: '2px', 
              textShadow: '0 1px 8px rgba(0,0,0,0.9)', 
              whiteSpace: 'nowrap',
              transition: 'color 0.3s ease'
            }}>{companyName}</p>
          </div>
        </div>
 
        {/* Desktop Navigation Pill */}
        {activeTab !== 'manage' ? (
          <div className="desktop-nav" style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
            <SpatialCard className="dark-obsidian-panel" maxTilt={4} hoverScale={1} style={{ 
              position: 'relative',
              display: 'flex', gap: '4px', padding: '6px', borderRadius: '16px',
              background: 'rgba(16, 18, 26, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
              overflow: 'visible',
              backdropFilter: 'blur(30px) saturate(210%)',
              WebkitBackdropFilter: 'blur(30px) saturate(210%)'
            }}>
              {/* Liquid Sliding Background Capsule */}
              {activeRect.width > 0 && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '6px',
                    bottom: '6px',
                    left: 0,
                    width: `${activeRect.width}px`,
                    transform: `translateX(${activeRect.left}px)`,
                    background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    borderRadius: '12px',
                    transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), width 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }}
                />
              )}
              
              <TabButton btnRef={el => buttonRefs.current['overview'] = el} active={activeTab === 'overview'} icon={Info} label="Overview" onClick={() => setActiveTab('overview')} />
              <TabButton btnRef={el => buttonRefs.current['renders'] = el} active={activeTab === 'renders'} icon={ImageIcon} label="Renders" onClick={() => setActiveTab('renders')} />
              <TabButton btnRef={el => buttonRefs.current['cinematics'] = el} active={activeTab === 'cinematics'} icon={Video} label="Videos" onClick={() => setActiveTab('cinematics')} />
              <TabButton btnRef={el => buttonRefs.current['floorplans'] = el} active={activeTab === 'floorplans'} icon={Layers} label="Floorplans" onClick={() => setActiveTab('floorplans')} />
              <TabButton btnRef={el => buttonRefs.current['availability'] = el} active={activeTab === 'availability'} icon={ListChecks} label="Availability" onClick={() => setActiveTab('availability')} />
              <TabButton btnRef={el => buttonRefs.current['map'] = el} active={activeTab === 'map'} icon={Map} label="Location" onClick={() => setActiveTab('map')} />
              <TabButton btnRef={el => buttonRefs.current['panorama'] = el} active={activeTab === 'panorama'} icon={Hexagon} label="360° Tours" onClick={() => setActiveTab('panorama')} />
              <TabButton btnRef={el => buttonRefs.current['3d'] = el} active={activeTab === '3d'} icon={Component} label="3D Interactive" onClick={() => setActiveTab('3d')} />
            </SpatialCard>
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
              className="dark-obsidian-panel hover-lift header-manage-btn" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '30px', background: activeTab === 'manage' ? 'var(--input-bg)' : 'var(--accent-color)', cursor: 'pointer', border: activeTab === 'manage' ? '1px solid var(--border-color)' : '1px solid rgba(255,255,255,0.1)', color: activeTab === 'manage' ? 'var(--text-primary)' : 'white', fontWeight: 'bold' }}>
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
            onMouseEnter={() => setHoveredFullscreen(true)}
            onMouseLeave={() => setHoveredFullscreen(false)}
            className="dark-obsidian-panel hover-lift icon-action-btn fullscreen-btn" 
            title="Fullscreen"
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              width: '48px', height: '48px', padding: '0', 
              borderRadius: '50%', 
              background: hoveredFullscreen ? 'rgba(255, 255, 255, 0.15)' : 'rgba(16, 18, 26, 0.45)', 
              cursor: 'pointer', 
              border: '1px solid rgba(255, 255, 255, 0.14)', 
              color: '#ffffff',
              boxShadow: hoveredFullscreen 
                ? '0 12px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.22)' 
                : '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(30px) saturate(210%)',
              WebkitBackdropFilter: 'blur(30px) saturate(210%)',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}>
            <Maximize size={18} color="#ffffff" style={{ transition: 'color 0.3s' }} />
          </button>

          {/* Share Button (Hidden on Manage) */}
          {activeTab !== 'manage' && (
            <button 
              onClick={() => setIsShareModalOpen(true)}
              onMouseEnter={() => setHoveredShare(true)}
              onMouseLeave={() => setHoveredShare(false)}
              className="dark-obsidian-panel hover-lift icon-action-btn" 
              title="Share"
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                width: '48px', height: '48px', padding: '0', 
                borderRadius: '50%', 
                background: hoveredShare ? 'rgba(255, 255, 255, 0.15)' : 'rgba(16, 18, 26, 0.45)', 
                cursor: 'pointer', 
                border: '1px solid rgba(255, 255, 255, 0.14)', 
                color: '#ffffff',
                boxShadow: hoveredShare 
                  ? '0 12px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.22)' 
                  : '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(30px) saturate(210%)',
                WebkitBackdropFilter: 'blur(30px) saturate(210%)',
                transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}>
              <Share2 size={18} color="#ffffff" style={{ transition: 'color 0.3s' }} />
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button 
            className="mobile-nav-toggle dark-obsidian-panel icon-action-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onMouseEnter={() => setHoveredMobileMenu(true)}
            onMouseLeave={() => setHoveredMobileMenu(false)}
            style={{ 
              width: '48px', height: '48px', borderRadius: '50%', 
              background: hoveredMobileMenu ? 'rgba(255, 255, 255, 0.15)' : 'rgba(16, 18, 26, 0.45)', 
              border: '1px solid rgba(255, 255, 255, 0.14)', 
              color: '#ffffff', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: hoveredMobileMenu 
                ? '0 12px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.22)' 
                : '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(30px) saturate(210%)',
              WebkitBackdropFilter: 'blur(30px) saturate(210%)',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
          >
            {isMobileMenuOpen ? (
              <X size={24} color="#ffffff" style={{ transition: 'color 0.3s' }} />
            ) : (
              <Menu size={24} color="#ffffff" style={{ transition: 'color 0.3s' }} />
            )}
          </button>
        </div>
      </div>


      {/* Mobile Full-Screen Menu Overlay */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh',
        background: 'rgba(10, 12, 18, 0.98)', backdropFilter: 'blur(30px)',
        zIndex: 101, 
        padding: '80px 24px 32px', overflowY: 'auto',
        opacity: isMobileMenuOpen ? 1 : 0, pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-20px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* Close Button to Exit Mobile Drawer */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="dark-obsidian-panel icon-action-btn"
          title="Close Menu"
          style={{
            position: 'absolute',
            top: '20px',
            right: '24px',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(16, 18, 26, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.22)',
            zIndex: 102
          }}
        >
          <X size={20} color="#ffffff" />
        </button>

        {/* Top Section: Tab Buttons Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '8px', 
          width: '100%',
          maxWidth: '340px',
          flex: 'none' 
        }}>
          <TabButton active={activeTab === 'overview'} icon={Info} label="Overview" isMobile onClick={() => setActiveTab('overview')} />
          <TabButton active={activeTab === 'renders'} icon={ImageIcon} label="Renders" isMobile onClick={() => setActiveTab('renders')} />
          <TabButton active={activeTab === 'cinematics'} icon={Video} label="Videos" isMobile onClick={() => setActiveTab('cinematics')} />
          <TabButton active={activeTab === 'floorplans'} icon={Layers} label="Floorplans" isMobile onClick={() => setActiveTab('floorplans')} />
          <TabButton active={activeTab === 'availability'} icon={ListChecks} label="Availability" isMobile onClick={() => setActiveTab('availability')} />
          <TabButton active={activeTab === 'map'} icon={Map} label="Location" isMobile onClick={() => setActiveTab('map')} />
          <TabButton active={activeTab === 'panorama'} icon={Hexagon} label="360° Tours" isMobile onClick={() => setActiveTab('panorama')} />
          <TabButton active={activeTab === '3d'} icon={Component} label="3D Interactive" isMobile onClick={() => setActiveTab('3d')} />
        </div>
        
        {/* Bottom Section: Ambient Music and/or Admin button */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          width: '100%',
          maxWidth: '340px',
          flex: 'none',
          marginBottom: '16px'
        }}>
          {activeTab !== 'manage' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', width: '100%', textAlign: 'left', paddingLeft: '8px' }}>
                Ambient Music
              </div>
              <AmbientSoundPlayer isMobileDrawer={true} />
            </div>
          )}
          {isAdmin && (
            <button 
              onClick={() => setActiveTab('manage')}
              className="dark-obsidian-panel" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '12px', borderRadius: '14px', background: activeTab === 'manage' ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)', border: activeTab === 'manage' ? 'none' : '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold', fontSize: '15px' }}>
              <Settings size={20} /> Manage
            </button>
          )}
        </div>
      </div>

      {/* Main Content Viewport */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        {activeTab === 'overview' && (
          <div key="overview" className="animate-tab-content" style={{ width: '100%', height: '100%' }}>
            <ProjectOverview onNavigate={setActiveTab} />
          </div>
        )}
        {activeTab === 'cinematics' && (
          <div key="cinematics" className="animate-tab-content" style={{ width: '100%', height: '100%' }}>
            <CinematicsTab />
          </div>
        )}
        
        {/* Keep RendersGallery mounted to prevent reloading images every time the user visits this tab */}
        <div className="animate-tab-content" style={{ display: activeTab === 'renders' ? 'block' : 'none', width: '100%', height: '100%' }}>
          <RendersGallery />
        </div>
        
        {activeTab === 'floorplans' && (
          <div key="floorplans" className="animate-tab-content" style={{ width: '100%', height: '100%' }}>
            <FloorplanViewer />
          </div>
        )}
        {activeTab === 'availability' && (
          <div key="availability" className="animate-tab-content" style={{ width: '100%', height: '100%' }}>
            <AvailabilityTab onNavigate={setActiveTab} />
          </div>
        )}
        {activeTab === 'map' && (
          <div key="map" className="animate-tab-content" style={{ width: '100%', height: '100%' }}>
            <ProjectMap />
          </div>
        )}
        {activeTab === 'panorama' && (
          <div key="panorama" className="animate-tab-content" style={{ width: '100%', height: '100%' }}>
            <PanoramaViewer />
          </div>
        )}
        {activeTab === 'manage' && isAdmin && (
          <div key="manage" className="animate-tab-content" style={{ width: '100%', height: '100%' }}>
            <AssetManager />
          </div>
        )}
        
        {/* We reuse the StandaloneView for the 3D portion since it has the Sidebars built-in.
            It uses lazy execution naturally by mounting the Canvas only when this tab is selected! */}
        {activeTab === '3d' && (
          <div key="3d" className="animate-tab-content" style={{ width: '100%', height: '100%' }}>
            {isMobileDevice ? (
              <MobileARView isEmbedded={true} />
            ) : (
              <Suspense fallback={<div style={{color:'white', padding: 50}}>Loading WebGL Engine...</div>}>
                <StandaloneView isNested={true} />
              </Suspense>
            )}
          </div>
        )}
      </div>

      {/* Premium ambient soundtrack player loop */}
      {activeTab !== 'manage' && !isMobileDevice && <AmbientSoundPlayer activeTab={activeTab} />}

      {/* Global Footer Watermark */}
      <div style={{
        position: 'absolute', 
        bottom: (activeTab === '3d' && controlMode === 'walk' && isTouchDevice) ? '8px' : '32px', 
        left: (activeTab === '3d' && controlMode === 'walk' && isTouchDevice) ? '48px' : '32px',  
        zIndex: 100,
        pointerEvents: 'auto', 
        display: 'flex', 
        alignItems: 'center',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
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

      {activeTab !== 'standalone' && (!isMobileDevice || !isMobileMenuOpen) && <FloatingConcierge />}
      {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} />}
    </div>
  );
}

// Vercel webhook trigger: force rebuild stable pre-redesign v1

