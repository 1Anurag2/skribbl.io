import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Result from './pages/Result';
import { SocketProvider } from './context/SocketContext';
import { PlayerProvider } from './context/PlayerContext';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <PlayerProvider>
          <GameProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lobby/:roomId" element={<Lobby />} />
              <Route path="/game/:roomId" element={<Game />} />
              <Route path="/result/:roomId" element={<Result />} />
            </Routes>
          </GameProvider>
        </PlayerProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
