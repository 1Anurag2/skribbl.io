import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import { GamePhase } from '../../../shared/enums';
import Canvas from '../components/Canvas';
import Timer from '../components/Timer';
import ChatBox from '../components/ChatBox';
import Leaderboard from '../components/Leaderboard';
import VotekickModal from '../components/VotekickModal';
import { SocketEvents } from '../types';

const Game: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { socket } = useSocket();
  const { roomState, setRoomState } = useGame();
  const { player } = usePlayer();
  const navigate = useNavigate();
  
  const [wordOptions, setWordOptions] = useState<string[]>([]);
  const [time, setTime] = useState(roomState?.settings.drawTime || 80);

  useEffect(() => {
    if (!socket || !roomId || !roomState) {
      navigate('/');
      return;
    }

    const handleStateUpdate = (state: any) => {
      setRoomState(state);
    };

    socket.on(SocketEvents.START_GAME, handleStateUpdate);
    socket.on('WORD_SELECTED', handleStateUpdate);
    socket.on(SocketEvents.ROUND_END, handleStateUpdate);
    socket.on(SocketEvents.GAME_OVER, handleStateUpdate);
    socket.on('HINT_REVEALED', handleStateUpdate);
    
    socket.on('WORD_OPTIONS', ({ words }) => {
      setWordOptions(words);
    });

    socket.on('TIMER_TICK', ({ time }) => {
      setTime(time);
    });

    return () => {
      socket.off(SocketEvents.START_GAME, handleStateUpdate);
      socket.off('WORD_SELECTED', handleStateUpdate);
      socket.off(SocketEvents.ROUND_END, handleStateUpdate);
      socket.off(SocketEvents.GAME_OVER, handleStateUpdate);
      socket.off('HINT_REVEALED', handleStateUpdate);
      socket.off('WORD_OPTIONS');
      socket.off('TIMER_TICK');
    };
  }, [socket, roomId, navigate, setRoomState, roomState]);

  const handleSelectWord = (word: string) => {
    if (socket) {
      socket.emit('WORD_SELECTED', { word });
      setWordOptions([]);
    }
  };

  useEffect(() => {
    // If we missed the WORD_OPTIONS event due to routing, ask for it again
    if (socket && roomState?.gamePhase === GamePhase.WORD_SELECTION && wordOptions.length === 0) {
      socket.emit('REQUEST_WORD_OPTIONS');
    }
  }, [socket, roomState?.gamePhase, wordOptions.length]);

  if (!roomState) return <div>Loading...</div>;

  const currentPlayer = roomState.players.find(p => p.id === player?.id);
  const isDrawer = currentPlayer?.isDrawer || false;

  return (
    <div className="flex flex-col h-screen min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white p-4 shadow flex justify-between items-center z-10">
        <div className="flex flex-col">
          <span className="font-bold text-gray-700">Round {roomState.currentRound} / {roomState.settings.rounds}</span>
        </div>
        
        <div className="text-xl font-bold tracking-widest text-indigo-700">
          {roomState.gamePhase === GamePhase.DRAWING ? roomState.hints : 'WAITING...'}
        </div>
        
        <Timer time={time} />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Main Game Area */}
        <div className="order-1 lg:order-2 w-full lg:flex-1 flex flex-col relative items-center justify-center p-2 lg:p-4 shrink-0 min-h-[300px] lg:min-h-0 z-10">
          
          {roomState.gamePhase === GamePhase.WORD_SELECTION && (
            <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center rounded-lg m-4">
              <div className="bg-white p-8 rounded-lg text-center shadow-xl">
                {isDrawer ? (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Choose a word to draw</h2>
                    <div className="flex gap-4">
                      {wordOptions.map(word => (
                        <button 
                          key={word} 
                          onClick={() => handleSelectWord(word)}
                          className="px-6 py-3 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 transition"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <h2 className="text-2xl font-bold text-gray-700 animate-pulse">Waiting for drawer to choose a word...</h2>
                )}
              </div>
            </div>
          )}

          {roomState.gamePhase === GamePhase.ROUND_END && (
            <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center rounded-lg m-4">
              <div className="bg-white p-8 rounded-lg text-center shadow-xl">
                <h2 className="text-2xl font-bold mb-4">Round Ended</h2>
                <p className="text-lg">The word was: <span className="font-bold text-indigo-600">{roomState.currentWord}</span></p>
                <p className="text-gray-500 mt-4 text-sm">Next round starting soon...</p>
              </div>
            </div>
          )}

          {roomState.gamePhase === GamePhase.GAME_OVER && (
            <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center rounded-lg m-4">
              <div className="bg-white p-10 rounded-2xl text-center shadow-2xl max-w-md w-full">
                <h2 className="text-4xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-sm">Game Over!</h2>
                
                <div className="flex flex-col gap-3 mb-8">
                  {[...roomState.players].sort((a, b) => b.score - a.score).slice(0, 3).map((p, i) => (
                    <div key={p.id} className={`flex justify-between items-center p-4 rounded-xl border-2 ${i === 0 ? 'bg-yellow-50 border-yellow-400 transform scale-105 shadow-md' : i === 1 ? 'bg-gray-50 border-gray-300' : 'bg-orange-50 border-orange-300'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                        <span className="font-bold text-lg">{p.name}</span>
                      </div>
                      <span className="font-black text-indigo-600 text-xl">{p.score} pts</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => navigate(`/lobby/${roomId}`)}
                  className="w-full py-4 rounded-xl font-bold text-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transform transition active:scale-95"
                >
                  Return to Lobby
                </button>
              </div>
            </div>
          )}

          {/* Canvas always mounts but its interaction is based on isDrawer */}
          <Canvas isDrawer={isDrawer} />
          
        </div>

        {/* Mobile Side-by-Side Wrapper */}
        <div className="order-2 flex flex-row w-full flex-1 lg:contents min-h-[40vh] lg:min-h-0">
          {/* Sidebar Leaderboard */}
          <div className="lg:order-1 lg:w-64 w-1/2 h-full lg:h-auto shrink-0 border-r-2 lg:border-r-0 border-gray-300">
            <Leaderboard />
          </div>

          {/* Chat Area */}
          <div className="lg:order-3 w-1/2 lg:w-80 h-full lg:h-auto shrink-0 lg:border-l-4 border-gray-200 bg-white">
            <ChatBox isDrawer={isDrawer} />
          </div>
        </div>
      </div>
      <VotekickModal roomId={roomId || ''} />
    </div>
  );
};

export default Game;
