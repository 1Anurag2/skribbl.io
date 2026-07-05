import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { usePlayer } from '../context/PlayerContext';
import { useGame } from '../context/GameContext';
import { SocketEvents } from '../types';
import { gameService } from '../services/gameService';

const Home: React.FC = () => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const { socket, isConnected } = useSocket();
  const { setPlayer } = usePlayer();
  const { setRoomState } = useGame();
  const navigate = useNavigate();

  // Array of 10 distinct seed names for DiceBear API
  const avatars = [
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Felix',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Mimi',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Oliver',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sasha',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Bandit',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Peanut',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Ginger',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Spooky',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Tinkerbell'
  ];

  const currentAvatar = avatars[avatarIndex];

  const handleCreateRoom = () => {
    if (!name || !socket) {
      setErrorMsg('Please enter your nickname first!');
      return;
    }
    setErrorMsg('');
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    setPlayer({ id: socket.id || '', name, score: 0, isDrawer: false, hasGuessedCorrectly: false, avatar: currentAvatar });
    
    gameService.createRoom(socket, newRoomId, name, currentAvatar);
    
    socket.once(SocketEvents.ROOM_JOINED, (state) => {
      setRoomState(state);
      navigate(`/lobby/${newRoomId}`);
    });
  };

  const handleJoinRoom = () => {
    if (!name || !socket) {
      setErrorMsg('Please enter your nickname first!');
      return;
    }
    setErrorMsg('');
    
    setPlayer({ id: socket.id || '', name, score: 0, isDrawer: false, hasGuessedCorrectly: false, avatar: currentAvatar });
    
    if (roomId) {
      // Join specific private/public room
      gameService.joinRoom(socket, roomId, name, currentAvatar);
    } else {
      // Play public! Join any available or create new public room
      gameService.playPublic(socket, name, currentAvatar);
    }
    
    socket.once(SocketEvents.ROOM_JOINED, (state) => {
      setRoomState(state);
      navigate(`/lobby/${state.roomId}`);
    });
    
    socket.once(SocketEvents.ROOM_NOT_FOUND, (error) => {
      setErrorMsg(error.message);
    });
  };

  if (!isConnected) {
    return <div className="flex items-center justify-center h-screen bg-gray-100">Connecting to server...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-12 pb-8">
      {/* Logo */}
      <div className="text-6xl md:text-7xl font-black mb-4 tracking-wider flex items-center gap-1" style={{ textShadow: '4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000' }}>
        <span className="text-red-500">s</span>
        <span className="text-orange-500">k</span>
        <span className="text-yellow-400">r</span>
        <span className="text-green-500">i</span>
        <span className="text-cyan-400">b</span>
        <span className="text-blue-500">b</span>
        <span className="text-purple-500">l</span>
        <span className="text-pink-500">.</span>
        <span className="text-red-500">i</span>
        <span className="text-orange-500">o</span>
        <span className="text-yellow-400">!</span>
      </div>

      {/* Characters mock */}
      <div className="flex gap-1 mb-8">
        {['bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-green-500', 'bg-cyan-400', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'].map((color, i) => (
          <div key={i} className={`w-8 h-8 ${color} rounded-full border-2 border-black`}></div>
        ))}
      </div>

      {errorMsg && (
        <div className="bg-red-100 border-4 border-red-500 text-red-700 p-3 mb-4 rounded shadow-sm text-sm font-bold text-center w-full max-w-sm">
          ⚠️ {errorMsg}
        </div>
      )}
      
      {/* Form Container */}
      <div className="w-full max-w-sm bg-[#183072] p-4 rounded-lg shadow-[0_8px_0_0_#0f1f4a]">
        
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="Enter your name" 
            className="flex-1 p-2 border-2 border-black rounded text-black font-sans font-medium"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select className="w-24 p-2 border-2 border-black rounded bg-white text-black font-sans font-medium">
            <option>English</option>
          </select>
        </div>
        
        {/* Avatar Display */}
        <div className="flex justify-center items-center h-32 mb-4 relative">
          <div 
            onClick={() => setAvatarIndex((prev) => (prev > 0 ? prev - 1 : avatars.length - 1))}
            className="text-white text-3xl absolute left-4 cursor-pointer font-bold select-none hover:scale-125 transition-transform"
          >&lt;</div>
          <div className="w-24 h-24 bg-green-400 border-4 border-black rounded-xl overflow-hidden flex items-center justify-center">
            <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div 
            onClick={() => setAvatarIndex((prev) => (prev < avatars.length - 1 ? prev + 1 : 0))}
            className="text-white text-3xl absolute right-4 cursor-pointer font-bold select-none hover:scale-125 transition-transform"
          >&gt;</div>
        </div>
        
        {/* Play (Join) and Create Buttons */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Code (if joining)" 
              className="flex-1 p-3 border-2 border-black rounded text-black font-sans text-center font-bold uppercase tracking-widest"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            />
            <button 
              onClick={handleJoinRoom}
              className="bg-[#4ade80] hover:bg-[#22c55e] text-white p-3 rounded border-b-4 border-r-4 border-black font-bold text-xl px-6 active:translate-y-1 active:border-b-0 active:border-r-0"
              style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
            >
              Play!
            </button>
          </div>
          
          <button 
            onClick={handleCreateRoom}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white p-3 rounded border-b-4 border-r-4 border-black font-bold text-xl active:translate-y-1 active:border-b-0 active:border-r-0"
            style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
          >
            Create Private Room
          </button>
        </div>
      </div>
      
      {/* Footer Info Box */}
      <div className="mt-auto w-full max-w-5xl bg-[#183072]/80 text-white p-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-left text-sm font-sans mt-12 rounded-t-2xl shadow-xl">
        <div>
          <h3 className="font-bold text-2xl mb-4 text-white border-b-2 border-white/20 pb-2" style={{ fontFamily: 'Fredoka One' }}>About</h3>
          <p className="text-blue-100 leading-relaxed mb-4">
            <strong className="text-white">Skribbl.io Clone</strong> is a free online multiplayer drawing and guessing game. 
            A normal game consists of a few rounds in which every round someone has to draw their chosen word and others have to guess it to gain points!
          </p>
          <p className="text-blue-100 leading-relaxed">
            The person with the most points at the end of game will then be crowned as the winner!
          </p>
        </div>
        <div>
          <h3 className="font-bold text-2xl mb-4 text-white border-b-2 border-white/20 pb-2" style={{ fontFamily: 'Fredoka One' }}>News</h3>
          <ul className="space-y-3 text-blue-100">
            <li>
              <span className="font-bold text-green-400 block text-xs uppercase tracking-wider mb-1">July 4, 2026</span>
              <p>🎉 <strong>Initial Launch!</strong> Basic drawing, chatting, and guessing mechanics are now fully live in private rooms.</p>
            </li>
            <li>
              <span className="font-bold text-yellow-400 block text-xs uppercase tracking-wider mb-1">Coming Soon</span>
              <p>🎨 Custom avatars, more colors, brush sizes, and global public lobbies are currently in development!</p>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-2xl mb-4 text-white border-b-2 border-white/20 pb-2" style={{ fontFamily: 'Fredoka One' }}>How to play</h3>
          <ul className="list-decimal list-inside space-y-2 text-blue-100 leading-relaxed">
            <li>When it's your turn to draw, you will have to choose a word from three options and visualize that word in 80 seconds.</li>
            <li>When somebody else is drawing you have to type your guess into the chat to gain points.</li>
            <li>Be quick! The earlier you guess a word, the more points you get.</li>
            <li>Use the hint at the top of the screen if you get stuck.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
