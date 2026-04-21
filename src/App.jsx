import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PresentationApp from './pages/PresentationApp';
import EmbedView from './pages/EmbedView';
import MobileARView from './views/MobileARView';

function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'ar') {
    return <MobileARView />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PresentationApp />} />
        <Route path="/embed" element={<EmbedView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
