import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../context/GameContext';
import { usePlayer } from '../context/PlayerContext';
import { SocketEvents } from '../types';
import Leaderboard from '../components/Leaderboard';
import ChatBox from '../components/ChatBox';
import VotekickModal from '../components/VotekickModal';
import { RoomSettings } from '../types';
import { gameService } from '../services/gameService';

const Lobby: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { socket } = useSocket();
  const { roomState, setRoomState } = useGame();
  const { player } = usePlayer();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket || !roomId) {
      navigate('/');
      return;
    }

    const handleUpdate = (state: any) => {
      setRoomState(state);
    };

    const handleGameStarted = (state: any) => {
      setRoomState(state);
      navigate(`/game/${roomId}`);
    };

    socket.on(SocketEvents.PLAYER_JOINED, handleUpdate);
    socket.on(SocketEvents.PLAYER_LEFT, handleUpdate);
    socket.on(SocketEvents.START_GAME, handleGameStarted);

    return () => {
      socket.off(SocketEvents.PLAYER_JOINED, handleUpdate);
      socket.off(SocketEvents.PLAYER_LEFT, handleUpdate);
      socket.off(SocketEvents.START_GAME, handleGameStarted);
    };
  }, [socket, roomId, navigate, setRoomState]);

  const handleStartGame = () => {
    if (socket) {
      socket.emit(SocketEvents.START_GAME, { roomId });
    }
  };

  const updateSetting = (key: keyof RoomSettings, value: any) => {
    if (!isHost || !socket || !roomState) return;
    
    const newSettings = { ...settings, [key]: value };
    gameService.updateSettings(socket, roomState.roomId, newSettings);
  };

  if (!roomState) return <div className="text-white font-bold text-2xl text-center mt-20">Loading room...</div>;

  const isHost = player?.id === roomState.hostId;
  const settings = roomState.settings;

  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto p-4 md:p-8">
      {/* Header Bar */}
      <div className="bg-white border-4 border-black rounded-t-xl flex justify-between items-center p-3 font-sans font-bold shadow-[0_4px_0_0_#000] z-10 mb-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-200 border-2 border-black overflow-hidden shadow-inner relative">
            {player?.avatar ? (
              <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-black">{player?.name?.charAt(0).toUpperCase()}</span>
            )}
            <div className="absolute -top-2 -left-2 w-4 h-4 border-4 border-black rounded-full bg-white"></div>
            <div className="absolute -top-2 -right-2 w-4 h-4 border-4 border-black rounded-full bg-white"></div>
          </div>
          <span className="text-xl">Round 1 of {settings.rounds}</span>
        </div>
        <div className="text-xl tracking-widest text-gray-500 uppercase">Waiting</div>
        <div 
          onClick={() => {
            if (socket) {
              socket.emit(SocketEvents.LEAVE_ROOM);
            }
            setRoomState(null);
            navigate('/');
          }}
          className="w-10 h-10 border-4 border-black rounded-full bg-red-400 cursor-pointer hover:bg-red-500 flex items-center justify-center text-white text-xl"
          title="Leave Room"
        >
          ✖
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden border-4 border-black rounded-b-xl shadow-[0_8px_0_0_#000] bg-white">
        {/* Left: Leaderboard */}
        <div className="w-64 border-r-4 border-black bg-[#dae0e6] overflow-y-auto">
          <Leaderboard />
        </div>

        {/* Middle: Settings */}
        <div className="flex-1 bg-[#2f3640] p-6 text-white font-sans overflow-y-auto flex flex-col">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <label className="font-bold flex items-center gap-2"><span className="text-xl">👤</span> Players</label>
              <select disabled={!isHost} value={settings.maxPlayers} onChange={(e) => updateSetting('maxPlayers', parseInt(e.target.value))} className="w-48 p-2 rounded text-black font-bold">
                {[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="font-bold flex items-center gap-2"><span className="text-xl">🌐</span> Language</label>
              <select disabled={!isHost} value={settings.language} onChange={(e) => updateSetting('language', e.target.value)} className="w-48 p-2 rounded text-black font-bold">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="font-bold flex items-center gap-2"><span className="text-xl">🗂️</span> Category</label>
              <select disabled={!isHost} value={settings.category || 'All'} onChange={(e) => updateSetting('category', e.target.value)} className="w-48 p-2 rounded text-black font-bold">
                <option value="All">All Words</option>
                <option value="Animals">Animals</option>
                <option value="Objects">Objects</option>
              </select>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="font-bold flex items-center gap-2"><span className="text-xl">⏱️</span> Drawtime</label>
              <select disabled={!isHost} value={settings.drawTime} onChange={(e) => updateSetting('drawTime', parseInt(e.target.value))} className="w-48 p-2 rounded text-black font-bold">
                {[15, 30, 45, 60, 80, 100, 120, 150, 180, 210, 240].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="font-bold flex items-center gap-2"><span className="text-xl">🔄</span> Rounds</label>
              <select disabled={!isHost} value={settings.rounds} onChange={(e) => updateSetting('rounds', parseInt(e.target.value))} className="w-48 p-2 rounded text-black font-bold">
                {[2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="font-bold flex items-center gap-2"><span className="text-xl">🎮</span> Game Mode</label>
              <select disabled={!isHost} value={settings.gameMode} onChange={(e) => updateSetting('gameMode', e.target.value)} className="w-48 p-2 rounded text-black font-bold">
                <option value="Normal">Normal</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="font-bold flex items-center gap-2"><span className="text-xl">📝</span> Word Count</label>
              <select disabled={!isHost} value={settings.wordCount} onChange={(e) => updateSetting('wordCount', parseInt(e.target.value))} className="w-48 p-2 rounded text-black font-bold">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="font-bold flex items-center gap-2"><span className="text-xl">❓</span> Hints</label>
              <select disabled={!isHost} value={settings.hintsCount} onChange={(e) => updateSetting('hintsCount', parseInt(e.target.value))} className="w-48 p-2 rounded text-black font-bold">
                {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-lg">Custom words</label>
              <label className="flex items-center gap-2 text-sm">
                Use custom words only 
                <input type="checkbox" disabled={!isHost} checked={settings.useCustomWordsOnly} onChange={(e) => updateSetting('useCustomWordsOnly', e.target.checked)} className="w-4 h-4 cursor-pointer" />
              </label>
            </div>
            <textarea 
              disabled={!isHost}
              value={settings.customWords}
              onChange={(e) => updateSetting('customWords', e.target.value)}
              placeholder="Minimum of 10 words. 1-32 characters per word! 20000 characters maximum. Separated by a , (comma)"
              className="w-full flex-1 p-3 rounded border-2 border-transparent focus:border-blue-400 bg-white text-black font-medium resize-none shadow-inner"
            ></textarea>
          </div>
          
          <div className="mt-6 flex gap-4 h-16">
            <button 
              onClick={handleStartGame}
              disabled={!isHost || roomState.players.length < 2}
              className={`flex-1 rounded font-bold text-3xl border-b-4 border-r-4 border-black active:border-0 active:translate-y-1 ${!isHost || roomState.players.length < 2 ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-[#4ade80] hover:bg-[#22c55e] text-white'}`}
              style={{ textShadow: (!isHost || roomState.players.length < 2) ? 'none' : '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
            >
              {roomState.players.length < 2 ? <span className="text-xl">Need more players...</span> : 'Start!'}
            </button>
            <button className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded font-bold text-3xl border-b-4 border-r-4 border-black active:border-0 active:translate-y-1 flex items-center justify-center gap-2"
              onClick={() => {
                navigator.clipboard.writeText(roomId);
                alert('Room code copied to clipboard!');
              }}
              style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
            >
              🔗 Invite
            </button>
          </div>
        </div>

        {/* Right: Chat */}
        <div className="w-80 border-l-4 border-black">
          <ChatBox isDrawer={false} />
        </div>
      </div>
      <VotekickModal roomId={roomId || ''} />
    </div>
  );
};

export default Lobby;
