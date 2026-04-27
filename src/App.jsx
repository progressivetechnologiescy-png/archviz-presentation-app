import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PresentationApp from './pages/PresentationApp';
import EmbedView from './pages/EmbedView';
import MobileARView from './views/MobileARView';
import DemoLandingPage from './pages/DemoLandingPage';

function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'ar') {
    return <MobileARView />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PresentationApp />} />
        <Route path="/demo" element={<DemoLandingPage />} />
        <Route path="/admin" element={<PresentationApp forceAdmin={true} />} />
        <Route path="/embed" element={<EmbedView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
