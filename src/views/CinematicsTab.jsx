import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { useViewerStore } from '../store/viewerStore';

function extractYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function convertToEmbedUrl(url) {
  if (!url) return '';
  const videoId = extractYoutubeId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
}

export function VideoModal({ videoUrl, title, onClose }) {
  if (!videoUrl) return null;
  
  const finalUrl = convertToEmbedUrl(videoUrl);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', zIndex: 9999,
      display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ 
        padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
      }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: '400', letterSpacing: '1px' }}>
          {title}
        </h2>
        <button onClick={onClose} className="hover-lift" style={{ 
          background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', 
          width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
        }}>
          <X size={24} />
        </button>
      </div>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5%' }}>
        {/* We use an aggressive aspect-ratio wrapper for cinematic 21:9 or 16:9 feel */}
        <div style={{ width: '100%', maxWidth: '1000px', aspectRatio: '16/9', background: 'black', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}>
          <iframe 
            src={finalUrl + "?autoplay=1&muted=0&controls=1&rel=0&showinfo=0"} 
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default function CinematicsTab() {
  const [activeVideo, setActiveVideo] = useState(null);
  const { setLightboxOpen, customVideos } = useViewerStore();

  React.useEffect(() => {
    setLightboxOpen(!!activeVideo);
    return () => setLightboxOpen(false);
  }, [activeVideo, setLightboxOpen]);

  // Use dynamic videos or fallback to an empty state
  const videos = customVideos && customVideos.length > 0 ? customVideos : [];

  const [thumbnailSize, setThumbnailSize] = useState('medium'); // small, medium, large
  const gridMinMax = {
    small: '200px',
    medium: '320px',
    large: '500px'
  }[thumbnailSize];

  return (
    <>
      <div 
        style={{ padding: '120px 32px 32px', height: '100%', overflowY: 'auto' }}
        onScroll={(e) => useViewerStore.getState().setGlobalScrolled(e.target.scrollTop > 50)}
        className="cinematics-container"
      >
        <style>{`
          .cinematics-container { padding: 120px 32px 32px !important; }
          .cinematics-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; flex-wrap: wrap; gap: 16px; }
          .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(var(--grid-min), 1fr));
            gap: 24px;
            transition: all 0.3s ease;
          }
          .video-card {
            position: relative;
            border-radius: 20px;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 12px 32px rgba(0,0,0,0.3);
            border: 1px solid var(--border-glass) !important;
            aspect-ratio: 16/9;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .video-card-bg {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .video-card:hover .video-card-bg {
            transform: scale(1.05);
          }
          .video-card-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(10, 12, 16, 0.85) 0%, rgba(10, 12, 16, 0.25) 50%, rgba(10, 12, 16, 0.1) 100%);
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 24px;
            transition: background 0.4s ease;
          }
          .video-card:hover .video-card-overlay {
            background: linear-gradient(to top, rgba(10, 12, 16, 0.95) 0%, rgba(10, 12, 16, 0.4) 50%, rgba(10, 12, 16, 0.2) 100%);
          }
          .play-btn-glow {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: var(--accent-color);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px var(--accent-glow);
            flex-shrink: 0;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .video-card:hover .play-btn-glow {
            transform: scale(1.12);
            background: #ffffff;
            box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3);
          }
          .video-card:hover .play-btn-glow svg {
            fill: var(--accent-color) !important;
            color: var(--accent-color) !important;
          }
          .play-btn-glow svg {
            transition: all 0.4s ease;
          }
          @media (max-width: 768px) {
            .cinematics-container { padding: 100px 16px 32px !important; }
            .cinematics-header { flex-direction: column; align-items: stretch !important; gap: 16px; }
            .gallery-grid {
              grid-template-columns: repeat(auto-fill, minmax(100%, 1fr)) !important;
              gap: 16px;
            }
          }
        `}</style>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          <div className="cinematics-header">
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: '300', margin: '0 0 12px 0' }}>Property Videos</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '18px' }}>
                Experience the property through ultra high-definition drone flyovers and narrative tours.
              </p>
            </div>
            
            {/* Thumbnail Size Toggle */}
            <div className="glass-panel" style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '20px' }}>
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  onClick={() => setThumbnailSize(size)}
                  style={{
                    padding: '6px 16px', borderRadius: '16px', border: 'none',
                    background: thumbnailSize === size ? 'var(--accent-color)' : 'transparent',
                    color: thumbnailSize === size ? 'white' : 'var(--text-secondary)',
                    fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                    textTransform: 'capitalize', fontSize: '12px'
                  }}>
                  {size.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {videos.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '8px' }}>No Videos Yet</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Add YouTube or Vimeo URLs from the Admin CMS to populate this gallery.</p>
            </div>
          ) : (
            <div className="gallery-grid" style={{ '--grid-min': gridMinMax }}>
              {[...videos].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map(film => (
                <div 
                  key={film.id} 
                  className="video-card"
                  onClick={() => setActiveVideo(film)}
                >
                  <div 
                    className="video-card-bg" 
                    style={{ 
                      backgroundImage: film.thumbnail_url ? `url(${film.thumbnail_url})` : 'none',
                      backgroundColor: '#111'
                    }} 
                  />
                  <div className="video-card-overlay">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 2 }}>
                      <div className="play-btn-glow">
                        <Play fill="white" color="white" size={20} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{film.title}</h3>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--accent-color)', fontSize: '14px', fontWeight: 'bold', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>Play Video</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {activeVideo && (
        <VideoModal 
          title={activeVideo.title}
          videoUrl={activeVideo.video_url} 
          onClose={() => setActiveVideo(null)} 
        />
      )}
    </>
  );
}
