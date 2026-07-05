import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { SocketEvents, VotekickState } from '../types';
import { gameService } from '../services/gameService';

const VotekickModal: React.FC<{ roomId: string }> = ({ roomId }) => {
  const { socket } = useSocket();
  const [voteState, setVoteState] = useState<VotekickState | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEvents.VOTEKICK_START, (data: any) => {
      setVoteState({ ...data, status: 'ongoing' });
      setHasVoted(false);
    });

    socket.on(SocketEvents.VOTEKICK_UPDATE, (data: any) => {
      setVoteState(prev => {
        if (!prev) return null;
        if (data.status !== 'ongoing') {
          setTimeout(() => setVoteState(null), 3000); // Hide after 3 seconds
        }
        return { ...prev, ...data };
      });
    });

    return () => {
      socket.off(SocketEvents.VOTEKICK_START);
      socket.off(SocketEvents.VOTEKICK_UPDATE);
    };
  }, [socket]);

  if (!voteState) return null;

  const handleVote = (vote: 'yes' | 'no') => {
    if (socket && !hasVoted) {
      gameService.castVote(socket, roomId, vote);
      setHasVoted(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0_0_#000] z-50 w-72">
      <h3 className="font-black text-lg mb-2">Votekick Started!</h3>
      
      {voteState.status === 'ongoing' ? (
        <>
          <p className="text-sm font-bold text-gray-700 mb-4">
            Kick <span className="text-red-600">{voteState.targetName}</span>?
          </p>
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-green-600">Yes: {voteState.yes}</span>
            <span className="text-red-600">No: {voteState.no}</span>
          </div>
          {!hasVoted ? (
            <div className="flex gap-2">
              <button onClick={() => handleVote('yes')} className="flex-1 bg-green-500 text-white font-bold py-2 border-b-4 border-black rounded active:border-b-0 active:translate-y-1">YES</button>
              <button onClick={() => handleVote('no')} className="flex-1 bg-red-500 text-white font-bold py-2 border-b-4 border-black rounded active:border-b-0 active:translate-y-1">NO</button>
            </div>
          ) : (
            <div className="text-center font-bold text-gray-500 py-2">Vote cast! Waiting...</div>
          )}
        </>
      ) : (
        <div className={`text-center font-black py-4 ${voteState.status === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
          VOTE {voteState.status.toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default VotekickModal;
