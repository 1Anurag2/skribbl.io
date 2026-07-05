import { Server, Socket } from 'socket.io';
import { SocketEvents } from '../../../shared/events';
import { gameService } from '../services/GameService';
import { roomService } from '../services/RoomService';

export const registerGameEvents = (io: Server, socket: Socket) => {
  const getRoomId = (): string | null => {
    for (const [roomId, room] of (roomService as any).rooms.entries()) {
      if (room.getPlayer(socket.id)) {
        return roomId;
      }
    }
    return null;
  };

  socket.on(SocketEvents.START_GAME, () => {
    const roomId = getRoomId();
    if (roomId) {
      gameService.startGame(io, roomId);
    }
  });

  socket.on('WORD_SELECTED', ({ word }) => {
    const roomId = getRoomId();
    if (roomId) {
      gameService.chooseWord(io, roomId, word);
    }
  });

  socket.on('REQUEST_WORD_OPTIONS', () => {
    const roomId = getRoomId();
    if (roomId) {
      const room = roomService.getRoom(roomId);
      if (room && room.game) {
        const drawer = room.getPlayersList().find(p => p.isDrawer);
        if (drawer && drawer.id === socket.id) {
          socket.emit('WORD_OPTIONS', { words: room.game.currentWordOptions });
        }
      }
    }
  });
};
