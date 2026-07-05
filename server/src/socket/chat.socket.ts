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

    const room = roomService.getRoom(roomId);
    if (!room) return;

    const player = room.getPlayer(socket.id);
    if (!player) return;

    const isCorrect = gameService.handleGuess(io, roomId, socket.id, text);

    const message: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      senderId: socket.id,
      senderName: playerName,
      text: isCorrect ? 'guessed the word!' : text,
      isSystem: isCorrect,
      isCorrectGuess: isCorrect
    };

    if (isCorrect) {
      // This is the "guessed the word!" system message, broadcast to everyone
      io.to(roomId).emit(SocketEvents.CHAT_MESSAGE, message);
      room.broadcastState(io, 'SCORES_UPDATED');
    } else {
      // Normal chat message
      if (player.hasGuessedCorrectly || player.isDrawer) {
        // Send only to players who also know the word (drawer + players who guessed correctly)
        room.getPlayersList().forEach(p => {
          if (p.hasGuessedCorrectly || p.isDrawer) {
            io.to(p.id).emit(SocketEvents.CHAT_MESSAGE, message);
          }
        });
      } else {
        // Player hasn't guessed yet, broadcast to everyone
        io.to(roomId).emit(SocketEvents.CHAT_MESSAGE, message);
      }
    }
  });
};
