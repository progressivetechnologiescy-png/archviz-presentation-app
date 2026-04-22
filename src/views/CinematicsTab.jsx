import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { useViewerStore } from '../store/viewerStore';

function extractYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
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
            src={videoUrl + "?autoplay=1&muted=0&controls=1&rel=0&showinfo=0"} 
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

  return (
    <>
      <div style={{ padding: '120px 32px 32px', height: '100%', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '300', margin: '0 0 12px 0' }}>Cinematic Films</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '18px' }}>
              Experience the property through ultra high-definition drone flyovers and narrative tours.
            </p>
          </div>

          {videos.length === 0 ? (
            <div style={{ padding: '64px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '8px' }}>No Cinematic Videos Yet</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Add YouTube or Vimeo URLs from the Admin CMS to populate this gallery.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {videos.map(film => (
                <div 
                  key={film.id} 
                  className="hover-lift"
                  onClick={() => setActiveVideo(film)}
                  style={{ 
                    borderRadius: '20px', overflow: 'hidden', cursor: 'pointer',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                    border: 'none',
                    position: 'relative',
                    aspectRatio: '16/9',
                    background: film.thumbnail_url ? `url(${film.thumbnail_url}) center/cover` : '#111'
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px var(--accent-glow)' }}>
                        <Play fill="white" size={20} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{film.title}</h3>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--accent-color)', fontSize: '14px', fontWeight: 'bold' }}>Play Video</p>
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
