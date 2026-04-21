import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PresentationApp from './pages/PresentationApp';
import EmbedView from './pages/EmbedView';

function App() {
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
