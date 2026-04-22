import React, { useState } from 'react';
import { Play, X } from 'lucide-react';

export function VideoModal({ videoUrl, title, onClose }) {
  if (!videoUrl) return null;

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
        <div style={{ width: '100%', maxWidth: '1400px', aspectRatio: '16/9', background: 'black', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.8)' }}>
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

const DUMMY_FILMS = [
  {
    id: 'f1',
    title: 'The Pinnacle - Full Cinematic Tour',
    duration: '03:15',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/506JiYPTDDI' 
  },
  {
    id: 'f2',
    title: 'Golden Hour Drone Flyover',
    duration: '01:45',
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/506JiYPTDDI' 
  },
  {
    id: 'f3',
    title: 'Interior Design Showcase',
    duration: '02:30',
    thumbnail: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/506JiYPTDDI' 
  }
];

export default function CinematicsTab() {
  const [activeVideo, setActiveVideo] = useState(null);
  const { setLightboxOpen } = useViewerStore();

  React.useEffect(() => {
    setLightboxOpen(!!activeVideo);
    return () => setLightboxOpen(false);
  }, [activeVideo, setLightboxOpen]);

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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
            {DUMMY_FILMS.map(film => (
              <div 
                key={film.id} 
                className="hover-lift"
                onClick={() => setActiveVideo(film)}
                style={{ 
                  borderRadius: '20px', overflow: 'hidden', cursor: 'pointer',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  position: 'relative',
                  aspectRatio: '16/9',
                  background: `url(${film.thumbnail}) center/cover`
                }}
              >
                {/* Play Button Overlay */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1))',
                  display: 'flex', flexDirection: 'column', padding: '24px', transition: 'all 0.3s ease',
                  justifyContent: 'space-between'
                }}>
                  
                  <div style={{ alignSelf: 'flex-end', background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '12px', backdropFilter: 'blur(4px)', fontWeight: 'bold', fontSize: '14px' }}>
                    {film.duration}
                  </div>

                  <div>
                    <div style={{ 
                      width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
                      boxShadow: '0 8px 24px var(--accent-glow)'
                    }}>
                      <Play size={32} color="white" fill="white" style={{ marginLeft: '4px' }} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '500', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                      {film.title}
                    </h3>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {activeVideo && (
        <VideoModal 
          videoUrl={activeVideo.videoUrl} 
          title={activeVideo.title} 
          onClose={() => setActiveVideo(null)} 
        />
      )}
    </>
  );
}
