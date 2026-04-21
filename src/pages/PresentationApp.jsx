import React, { useState, useEffect, Suspense } from 'react';
import { Layers, Image as ImageIcon, Map, Hexagon, Component, Settings, Info, ListChecks, Share2, Video } from 'lucide-react';
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
import ShareModal from '../components/ShareModal';
import FloatingConcierge from '../components/FloatingConcierge';

const TabButton = ({ active, icon: Icon, label, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px', cursor: 'pointer', borderRadius: '30px',
        background: active ? 'var(--accent-color)' : (isHovered ? 'rgba(255,255,255,0.1)' : 'transparent'),
        border: 'none',
        color: active ? 'white' : (isHovered ? 'white' : 'var(--text-secondary)'),
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)', fontWeight: '600', fontSize: '14px',
        boxShadow: active ? '0 4px 12px var(--accent-glow)' : 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0
      }}
    >
      <Icon size={16} /> {label}
    </button>
  );
};

export default function PresentationApp({ forceAdmin = false }) {
  const { fetchCloudAssets } = useViewerStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAdmin] = useState(() => {
    if (forceAdmin) return true;
    const params = new URLSearchParams(window.location.search);
    return params.get('admin') === 'true';
  });

  // Automatically wire the client state to the Cloud Database on app load!
  useEffect(() => {
    fetchCloudAssets(supabase);
  }, [fetchCloudAssets]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: 'var(--bg-gradient)', overflow: 'hidden' }}>
      
      {/* Global Responsive Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'nowrap', gap: '24px'
      }}>
        
        {/* Floating Logo - Top Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, pointerEvents: 'none' }}>
          <div style={{ 
            width: '48px', height: '48px', background: 'linear-gradient(135deg, var(--accent-color), #60a5fa)', 
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px var(--accent-glow)'
          }}>
            <Hexagon size={28} color="#fff" />
          </div>
          <div style={{ display: window.innerWidth < 1200 ? 'none' : 'block' }}>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700', letterSpacing: '0.5px', textShadow: '0 2px 10px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>The Pinnacle Residence</h1>
            <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', letterSpacing: '2px', whiteSpace: 'nowrap' }}>ARCHVIZ STUDIO LTD.</p>
          </div>
        </div>

        {/* Floating Navigation Pill - Center (Scrollable on tiny screens) */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          <div className="glass-panel" style={{ 
            display: 'flex', gap: '4px', padding: '6px', borderRadius: '40px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch',
            maxWidth: '100%'
          }}>
            <style>{`.glass-panel::-webkit-scrollbar { display: none; }`}</style>
            <TabButton active={activeTab === 'overview'} icon={Info} label="Overview" onClick={() => setActiveTab('overview')} />
            <TabButton active={activeTab === 'cinematics'} icon={Video} label="Films" onClick={() => setActiveTab('cinematics')} />
            <TabButton active={activeTab === 'renders'} icon={ImageIcon} label="Renders" onClick={() => setActiveTab('renders')} />
            <TabButton active={activeTab === 'floorplans'} icon={Layers} label="Floorplans" onClick={() => setActiveTab('floorplans')} />
            <TabButton active={activeTab === 'availability'} icon={ListChecks} label="Availability" onClick={() => setActiveTab('availability')} />
            <TabButton active={activeTab === 'map'} icon={Map} label="Location" onClick={() => setActiveTab('map')} />
            <TabButton active={activeTab === 'panorama'} icon={Hexagon} label="360° Tours" onClick={() => setActiveTab('panorama')} />
            <TabButton active={activeTab === '3d'} icon={Component} label="3D Interactive" onClick={() => setActiveTab('3d')} />
            <div style={{ width: '1px', background: 'var(--border-glass-light)', margin: '0 4px', flexShrink: 0 }}></div>
            {isAdmin && <TabButton active={activeTab === 'manage'} icon={Settings} label="Manage" onClick={() => setActiveTab('manage')} />}
          </div>
        </div>

        {/* Global Controls - Top Right */}
        <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="glass-panel hover-lift" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '30px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 'bold' }}>
            <Share2 size={16} /> Share
          </button>
        </div>

      </div>

      {/* Main Content Viewport */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        {activeTab === 'overview' && <ProjectOverview onNavigate={setActiveTab} />}
        {activeTab === 'cinematics' && <CinematicsTab />}
        {activeTab === 'renders' && <RendersGallery />}
        {activeTab === 'floorplans' && <FloorplanViewer />}
        {activeTab === 'availability' && <AvailabilityTab />}
        {activeTab === 'map' && <ProjectMap />}
        {activeTab === 'panorama' && <PanoramaViewer />}
        {activeTab === 'manage' && isAdmin && <AssetManager />}
        
        {/* We reuse the StandaloneView for the 3D portion since it has the Sidebars built-in.
            It uses lazy execution naturally by mounting the Canvas only when this tab is selected! */}
        {activeTab === '3d' && (
          <Suspense fallback={<div style={{color:'white', padding: 50}}>Loading WebGL Engine...</div>}>
            <StandaloneView isNested={true} />
          </Suspense>
        )}
      </div>

      <FloatingConcierge />
      {isShareModalOpen && <ShareModal onClose={() => setIsShareModalOpen(false)} />}
    </div>
  );
}
