import { Server, Socket } from 'socket.io';
import { SocketEvents } from '../../../shared/events';
import { StrokeData, Point } from '../../../shared/types';
import { roomService } from '../services/RoomService';

export const registerDrawEvents = (io: Server, socket: Socket) => {
  
  // A helper function to get roomId for the socket
  // (In a real app, you might want to cache this in socket.data or use RoomService)
  const getRoomId = (): string | null => {
    for (const [roomId, room] of (roomService as any).rooms.entries()) {
      if (room.getPlayer(socket.id)) {
        return roomId;
      }
    }
    return null;
  };

  socket.on(SocketEvents.DRAW_START, (data: StrokeData) => {
    const roomId = getRoomId();
    if (roomId) {
      socket.to(roomId).emit(SocketEvents.DRAW_START, data);
    }
  });

  socket.on(SocketEvents.DRAW_MOVE, (data: Point) => {
    const roomId = getRoomId();
    if (roomId) {
      socket.to(roomId).emit(SocketEvents.DRAW_MOVE, data);
    }
  });

  socket.on(SocketEvents.DRAW_END, () => {
    const roomId = getRoomId();
    if (roomId) {
      socket.to(roomId).emit(SocketEvents.DRAW_END);
    }
  });

  socket.on(SocketEvents.CANVAS_CLEAR, () => {
    const roomId = getRoomId();
    if (roomId) {
      socket.to(roomId).emit(SocketEvents.CANVAS_CLEAR);
    }
  });

  socket.on(SocketEvents.UNDO, () => {
    const roomId = getRoomId();
    if (roomId) {
      socket.to(roomId).emit(SocketEvents.UNDO);
    }
  });
};
