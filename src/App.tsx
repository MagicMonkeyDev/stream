import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletContextProvider } from './components/WalletProvider';
import { ChatProvider } from './context/ChatContext';
import { StreamProvider } from './context/StreamContext';
import { HomePage } from './pages/HomePage';
import { Stream } from './components/Stream';

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <BrowserRouter>
        <WalletContextProvider>
          <StreamProvider>
            <ChatProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/stream/:id" element={<Stream />} />
              </Routes>
            </ChatProvider>
          </StreamProvider>
        </WalletContextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;