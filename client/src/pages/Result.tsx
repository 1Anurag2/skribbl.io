import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const Result: React.FC = () => {
  const { roomState } = useGame();
  const navigate = useNavigate();

  if (!roomState) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">No game data found</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-indigo-600 text-white px-6 py-2 rounded"
        >
          Go Home
        </button>
      </div>
    );
  }

  const sortedPlayers = [...roomState.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-indigo-900 p-8 text-white">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl text-center text-gray-800">
        <h1 className="text-4xl font-extrabold mb-2 text-indigo-600">Game Over!</h1>
        
        {winner && (
          <div className="my-8 animate-bounce">
            <h2 className="text-2xl text-gray-600">Winner</h2>
            <div className="text-5xl font-black text-yellow-500 my-2">👑 {winner.name}</div>
            <div className="text-2xl font-bold text-indigo-700">{winner.score} Points</div>
          </div>
        )}

        <div className="text-left mt-8">
          <h3 className="text-xl font-bold border-b pb-2 mb-4">Final Leaderboard</h3>
          <div className="space-y-2">
            {sortedPlayers.map((p, index) => (
              <div key={p.id} className="flex justify-between p-3 bg-gray-50 rounded border">
                <span className="font-bold text-gray-600">#{index + 1} {p.name}</span>
                <span className="font-black text-indigo-600">{p.score} pts</span>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="mt-8 w-full bg-indigo-600 text-white p-4 rounded-lg font-bold hover:bg-indigo-700 transition"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default Result;
