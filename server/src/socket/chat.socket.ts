import { Server, Socket } from 'socket.io';
import { SocketEvents } from '../../../shared/events';
import { gameService } from '../services/GameService';
import { roomService } from '../services/RoomService';
import { ChatMessage } from '../../../shared/types';


export const registerChatEvents = (io: Server, socket: Socket) => {
  const getRoomId = (): string | null => {
    for (const [roomId, room] of (roomService as any).rooms.entries()) {
      if (room.getPlayer(socket.id)) {
        return roomId;
      }
    }
    return null;
  };

  socket.on(SocketEvents.GUESS, ({ text, playerName }) => {
    const roomId = getRoomId();
    if (!roomId) return;

    const isCorrect = gameService.handleGuess(io, roomId, socket.id, text);

    const message: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      senderId: socket.id,
      senderName: playerName,
      text: isCorrect ? 'guessed the word!' : text,
      isSystem: isCorrect,
      isCorrectGuess: isCorrect
    };

    io.to(roomId).emit(SocketEvents.CHAT_MESSAGE, message);

    if (isCorrect) {
      // Broadcast updated scores
      const room = roomService.getRoom(roomId);
      if (room) {
        room.broadcastState(io, 'SCORES_UPDATED');
      }
    }
  });
};
