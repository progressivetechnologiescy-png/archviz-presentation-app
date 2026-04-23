import React, { useState, useEffect } from 'react';
import { useViewerStore } from '../store/viewerStore';
import { X, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RendersGallery() {
  const customRenders = useViewerStore(state => state.customRenders);
  const setLightboxOpen = useViewerStore(state => state.setLightboxOpen);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract unique folders and sort them by folder_order
  const folderOrderMap = {};
  (customRenders || []).forEach(r => {
    if (r.folder_name) {
      const order = Number(r.folder_order);
      if (!isNaN(order)) {
        folderOrderMap[r.folder_name] = order;
      }
    }
  });

  const uniqueFolders = [...new Set((customRenders || []).map(r => r.folder_name).filter(Boolean))];
  const sortedFolders = uniqueFolders.sort((a, b) => (folderOrderMap[a] || 0) - (folderOrderMap[b] || 0));
  const folders = ['All', ...sortedFolders];

  const displayImages = (customRenders || []).map(r => 
    typeof r === 'string' ? { image_url: r, folder_name: 'Uncategorized', folder_order: 999, id: 0 } : r
  ).sort((a, b) => {
    const idxA = sortedFolders.indexOf(a.folder_name);
    const idxB = sortedFolders.indexOf(b.folder_name);
    if (idxA !== idxB) return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    
    // Preserve chronological DB sort (created_at DESC) for images within the same folder
    return 0;
  });

  const [thumbnailSize, setThumbnailSize] = useState('medium'); // small, medium, large

  // Autoplay Slideshow Logic
  useEffect(() => {
    let interval;
    if (isPlaying && selectedIndex !== null) {
      interval = setInterval(() => {
        setSelectedIndex(prev => (prev + 1) % displayImages.length);
      }, 2000); // 2 seconds between images
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedIndex, displayImages.length]);

  const [activeFolder, setActiveFolder] = useState('All');

  // Filter images based on active folder
  const filteredImages = displayImages.filter(r => activeFolder === 'All' || r.folder_name === activeFolder);

  if (displayImages.length === 0) {
    return (
      <div style={{ padding: '120px 32px 32px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '300', marginBottom: '16px' }}>No Renders Available</h2>
        <p>Please upload high-resolution renders via the Admin panel.</p>
      </div>
    );
  }

  // Determine grid styles based on thumbnailSize
  const gridStyles = {
    small: { minMax: '150px', height: '120px' },
    medium: { minMax: '300px', height: '250px' },
    large: { minMax: '500px', height: '400px' }
  }[thumbnailSize];

  return (
    <div 
      style={{ padding: '120px 32px 32px', height: '100%', overflowY: 'auto' }}
      onScroll={(e) => useViewerStore.getState().setGlobalScrolled(e.target.scrollTop > 50)}
      className="gallery-container"
    >
      <style>{`
        .gallery-container { padding: 120px 32px 32px !important; }
        .gallery-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(var(--grid-min), 1fr));
          gap: 24px;
          transition: all 0.3s ease;
        }
        @media (max-width: 768px) {
          .gallery-container { padding: 100px 16px 32px !important; }
          .gallery-header { flex-direction: column; align-items: stretch !important; gap: 16px; }
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(100%, 1fr)) !important;
            gap: 16px;
          }
        }
      `}</style>
      
      <div className="gallery-header">
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '300', margin: '0 0 16px 0' }}>Photorealistic Renders</h2>
          {/* Folder Category Filters */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {folders.map(folder => (
              <button 
                key={folder}
                onClick={() => setActiveFolder(folder)}
                style={{
                  padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  border: activeFolder === folder ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)',
                  background: activeFolder === folder ? 'rgba(255, 107, 0, 0.15)' : 'rgba(0,0,0,0.2)',
                  color: activeFolder === folder ? 'var(--accent-color)' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {folder}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Thumbnail Size Toggle */}
          <div className="glass-panel" style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '20px' }}>
            {['small', 'medium', 'large'].map(size => (
              <button
                key={size}
                onClick={() => setThumbnailSize(size)}
                title={`${size.charAt(0).toUpperCase() + size.slice(1)} Thumbnails`}
                style={{
                  padding: '6px 12px', borderRadius: '16px', border: 'none',
                  background: thumbnailSize === size ? 'var(--accent-color)' : 'transparent',
                  color: thumbnailSize === size ? 'white' : 'var(--text-secondary)',
                  fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
              </button>
            ))}
          </div>

          <button 
            onClick={() => { setSelectedIndex(0); setIsPlaying(true); setLightboxOpen(true); }}
            className="hover-lift"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '30px',
              background: 'var(--accent-color)', color: 'white', border: 'none',
              fontSize: '15px', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: '0 8px 24px var(--accent-glow)'
            }}
          >
            <Play size={18} fill="white" />
            Play Slideshow
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingBottom: '32px' }}>
        {folders.filter(f => f !== 'All' && (activeFolder === 'All' || activeFolder === f)).map(folder => {
          const folderImages = displayImages.filter(r => r.folder_name === folder);
          if (folderImages.length === 0) return null;
          
          return (
            <div key={folder}>
              {activeFolder === 'All' && <h3 style={{ fontSize: '20px', fontWeight: '500', marginBottom: '16px', color: 'var(--text-secondary)' }}>{folder}</h3>}
              <div 
                className="gallery-grid"
                style={{ '--grid-min': gridStyles.minMax }}
              >
                {folderImages.map((render, i) => {
                  const src = render.image_url;
                  const isRealImage = typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('http'));
                  return (
                    <div 
                      key={render.id || i} 
                      className="hover-lift" 
                      onClick={() => {
                        if (isRealImage) {
                          setSelectedIndex(displayImages.findIndex(r => r === render));
                          setLightboxOpen(true);
                        }
                      }}
                      style={{ 
                         height: gridStyles.height, 
                         background: isRealImage ? `url(${src}) center/cover` : `linear-gradient(45deg, #1f2937, #111827)`,
                         display: 'flex', alignItems: 'center', justifyContent: 'center',
                         color: 'rgba(255,255,255,0.2)', fontSize: '14px',
                         borderRadius: '12px', overflow: 'hidden', cursor: isRealImage ? 'zoom-in' : 'default',
                         position: 'relative',
                         transition: 'height 0.3s ease'
                      }}
                    >
                      {!isRealImage && `Render Placeholder ${src}`}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Engine */}
      {selectedIndex !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999,
          background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Header Controls */}
          <div style={{ position: 'absolute', top: '32px', right: '32px', display: 'flex', gap: '16px', zIndex: 3 }}>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="hover-lift"
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', width: '48px', height: '48px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} fill="white" />}
            </button>
            <button 
              onClick={() => { setSelectedIndex(null); setIsPlaying(false); setLightboxOpen(false); }}
              className="hover-lift"
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', width: '48px', height: '48px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Controls */}
          <button 
            onClick={() => setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
            className="hover-lift"
            style={{
              position: 'absolute', left: '32px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', width: '56px', height: '56px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3
            }}
          >
            <ChevronLeft size={32} />
          </button>
          
          <button 
            onClick={() => setSelectedIndex((prev) => (prev + 1) % displayImages.length)}
            className="hover-lift"
            style={{
              position: 'absolute', right: '32px', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', width: '56px', height: '56px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3
            }}
          >
            <ChevronRight size={32} />
          </button>

          {/* High Res Image */}
          <img 
            key={selectedIndex} // Force re-render for simple transition
            src={displayImages[selectedIndex]?.image_url} 
            alt="Fullscreen Render"
            style={{
              maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain',
              borderRadius: '8px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              userSelect: 'none',
              animation: 'fadeIn 0.5s ease-out'
            }}
          />
        </div>
      )}
    </div>
  );
}
