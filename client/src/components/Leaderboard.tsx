import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useSocket } from '../context/SocketContext';
import { usePlayer } from '../context/PlayerContext';
import { SocketEvents } from '../types';
import { gameService } from '../services/gameService';

const Leaderboard: React.FC = () => {
  const { roomState, setRoomState } = useGame();
  const { socket } = useSocket();

  const { player } = usePlayer();

  useEffect(() => {
    if (!socket) return;
    
    socket.on('SCORES_UPDATED', (state: any) => {
      setRoomState(state);
    });

    return () => {
      socket.off('SCORES_UPDATED');
    };
  }, [socket, setRoomState]);

  if (!roomState) return null;

  const isHost = player?.id === roomState.hostId;

  const handleKick = (targetId: string) => {
    if (socket && window.confirm('Are you sure you want to kick this player?')) {
      gameService.kickPlayer(socket, roomState.roomId, targetId);
    }
  };

  const handleVotekick = (targetId: string, targetName: string) => {
    if (socket && window.confirm(`Start a votekick against ${targetName}?`)) {
      gameService.startVotekick(socket, roomState.roomId, targetId, targetName);
    }
  };

  // Sort players by score descending
  const sortedPlayers = [...roomState.players].sort((a, b) => b.score - a.score);

  return (
    <div className="w-full lg:w-64 bg-white border-b-4 lg:border-b-0 lg:border-r-4 border-gray-200 flex flex-col h-full shadow-lg z-10 shrink-0">
      <div className="p-4 font-bold border-b bg-indigo-50 text-indigo-800 shadow-sm">
        Players & Leaderboard
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
        {sortedPlayers.map((p, index) => (
          <div 
            key={p.id} 
            className={`p-3 rounded-lg flex items-center justify-between border shadow-sm transition-all ${
              p.hasGuessedCorrectly ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-400 w-4 text-center">#{index + 1}</span>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 border-2 border-black overflow-hidden flex-shrink-0">
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-black text-black">{p.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className={`font-semibold ${p.isDrawer ? 'text-indigo-600' : 'text-gray-800'}`}>
                  {p.name} {p.isDrawer && '✏️'}
                </span>
                {p.hasGuessedCorrectly && !p.isDrawer && (
                  <span className="text-xs text-green-600 font-bold">Guessed!</span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-black text-lg text-indigo-700">{p.score}</span>
              {player && player.id !== p.id && (
                <div className="flex gap-1">
                  {isHost && (
                    <button onClick={() => handleKick(p.id)} className="text-[10px] bg-red-100 hover:bg-red-500 hover:text-white text-red-600 px-1 py-0.5 rounded border border-red-200">
                      Kick
                    </button>
                  )}
                  {!isHost && (
                    <button onClick={() => handleVotekick(p.id, p.name)} className="text-[10px] bg-yellow-100 hover:bg-yellow-500 hover:text-white text-yellow-700 px-1 py-0.5 rounded border border-yellow-300">
                      VoteKick
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
