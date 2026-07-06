import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { usePlayer } from '../context/PlayerContext';
import { SocketEvents } from '../types';
import { gameService } from '../services/gameService';
import { ChatMessage } from '../../../shared/types';

interface ChatBoxProps {
  isDrawer: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ isDrawer }) => {
  const { socket } = useSocket();
  const { player } = usePlayer();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on(SocketEvents.CHAT_MESSAGE, handleNewMessage);

    return () => {
      socket.off(SocketEvents.CHAT_MESSAGE, handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socket && !isDrawer) {
      gameService.sendGuess(socket, input, player?.name);
      setInput('');
    }
  };

  return (
    <div className="w-full lg:w-80 bg-white flex flex-col h-full shadow-lg">
      <div className="p-4 font-bold border-b bg-indigo-50 text-indigo-800 shadow-sm z-10">
        Chat & Guesses
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`p-2 rounded-lg text-sm ${
              msg.isSystem && msg.isCorrectGuess 
                ? 'bg-green-100 text-green-800 font-bold border border-green-200' 
                : msg.isSystem 
                ? 'bg-yellow-100 text-yellow-800 font-semibold text-center italic'
                : 'bg-white shadow-sm border border-gray-100'
            }`}
          >
            {!msg.isSystem && <span className="font-bold text-indigo-600 mr-2">{msg.senderName}:</span>}
            {msg.isSystem && msg.isCorrectGuess && <span className="font-bold mr-2">{msg.senderName}</span>}
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <input 
          type="text" 
          placeholder={isDrawer ? "Drawers cannot guess..." : "Type your guess here..."} 
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isDrawer}
        />
      </form>
    </div>
  );
};

export default ChatBox;
