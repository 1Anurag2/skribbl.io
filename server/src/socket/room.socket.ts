import { Server, Socket } from 'socket.io';
import { SocketEvents } from '../../../shared/events';
import { roomService } from '../services/RoomService';

export const registerRoomEvents = (io: Server, socket: Socket) => {
  
  socket.on(SocketEvents.CREATE_ROOM, ({ roomId, playerName, avatar }) => {
    const room = roomService.createRoom(roomId, socket.id, playerName, avatar);
    socket.join(roomId);
    
    // Send state back to the creator
    socket.emit(SocketEvents.ROOM_JOINED, room.getRoomStateForPlayer(socket.id));
    console.log(`${playerName} created room ${roomId}`);
  });

  socket.on(SocketEvents.JOIN_ROOM, ({ roomId, playerName, avatar }) => {
    const room = roomService.joinRoom(roomId, socket.id, playerName, avatar);
    
    if (room) {
      socket.join(roomId);
      
      // Notify the player who joined
      socket.emit(SocketEvents.ROOM_JOINED, room.getRoomStateForPlayer(socket.id));
      // Notify others in the room
      room.broadcastState(io, SocketEvents.PLAYER_JOINED);
      console.log(`${playerName} joined room ${roomId}`);
    } else {
      socket.emit(SocketEvents.ROOM_NOT_FOUND, { message: 'Room is full or does not exist.' });
    }
  });

  socket.on(SocketEvents.PLAY_PUBLIC, ({ playerName, avatar }) => {
    const room = roomService.findOrCreatePublicRoom(socket.id, playerName, avatar);
    socket.join(room.roomId);
    
    // Notify the player
    socket.emit(SocketEvents.ROOM_JOINED, room.getRoomStateForPlayer(socket.id));
    // Notify others
    room.broadcastState(io, SocketEvents.PLAYER_JOINED);
    console.log(`${playerName} joined public room ${room.roomId}`);
  });

  socket.on(SocketEvents.UPDATE_SETTINGS, ({ roomId, settings }) => {
    const room = roomService.getRoom(roomId);
    if (room && room.hostId === socket.id) {
      room.updateSettings(settings);
      room.broadcastState(io, SocketEvents.PLAYER_JOINED); // Re-use PLAYER_JOINED to update roomState across all clients
    }
  });

  socket.on(SocketEvents.LEAVE_ROOM, () => {
    let leftRoomId = null;
    
    // Find which room the socket was in
    for (const [roomId, room] of (roomService as any).rooms.entries()) {
      if (room.getPlayer(socket.id)) {
        leftRoomId = roomId;
        break;
      }
    }

    if (leftRoomId) {
      socket.leave(leftRoomId);
      const updatedRoom = roomService.leaveRoom(leftRoomId, socket.id);
      if (updatedRoom) {
        updatedRoom.broadcastState(io, SocketEvents.PLAYER_LEFT);
      }
    }
  });

  socket.on(SocketEvents.KICK_PLAYER, ({ roomId, targetId }) => {
    const room = roomService.getRoom(roomId);
    if (room && room.hostId === socket.id) {
      room.bannedPlayers.add(targetId);
      const targetSocket = io.sockets.sockets.get(targetId);
      if (targetSocket) {
        targetSocket.leave(roomId);
        targetSocket.emit(SocketEvents.ROOM_NOT_FOUND, { message: 'You have been kicked from the room.' });
      }
      roomService.leaveRoom(roomId, targetId);
      room.broadcastState(io, SocketEvents.PLAYER_LEFT);
      io.to(roomId).emit(SocketEvents.CHAT_MESSAGE, {
        playerId: 'system',
        playerName: 'System',
        text: 'A player was kicked by the host.'
      });
    }
  });

  socket.on(SocketEvents.VOTEKICK_START, ({ roomId, targetId, targetName }) => {
    const room = roomService.getRoom(roomId);
    if (room && !room.activeVotekick) {
      room.activeVotekick = {
        targetId,
        targetName,
        votesYes: new Set([socket.id]),
        votesNo: new Set(),
        timer: setTimeout(() => {
          if (room.activeVotekick) {
            io.to(roomId).emit(SocketEvents.VOTEKICK_UPDATE, { status: 'failed' });
            room.activeVotekick = null;
          }
        }, 15000)
      };
      io.to(roomId).emit(SocketEvents.VOTEKICK_START, { targetId, targetName, yes: 1, no: 0, total: room.players.size });
    }
  });

  socket.on(SocketEvents.VOTEKICK_VOTE, ({ roomId, vote }) => {
    const room = roomService.getRoom(roomId);
    if (room && room.activeVotekick) {
      if (vote === 'yes') room.activeVotekick.votesYes.add(socket.id);
      else room.activeVotekick.votesNo.add(socket.id);
      
      const yesVotes = room.activeVotekick.votesYes.size;
      const noVotes = room.activeVotekick.votesNo.size;
      const required = Math.floor(room.players.size / 2) + 1;
      
      io.to(roomId).emit(SocketEvents.VOTEKICK_UPDATE, { status: 'ongoing', yes: yesVotes, no: noVotes, required });
      
      if (yesVotes >= required) {
        clearTimeout(room.activeVotekick.timer);
        const targetId = room.activeVotekick.targetId;
        room.bannedPlayers.add(targetId);
        const targetSocket = io.sockets.sockets.get(targetId);
        if (targetSocket) {
          targetSocket.leave(roomId);
          targetSocket.emit(SocketEvents.ROOM_NOT_FOUND, { message: 'You have been votekicked from the room.' });
        }
        roomService.leaveRoom(roomId, targetId);
        room.broadcastState(io, SocketEvents.PLAYER_LEFT);
        io.to(roomId).emit(SocketEvents.VOTEKICK_UPDATE, { status: 'passed' });
        room.activeVotekick = null;
      }
    }
  });

  // Handle disconnect in this scope since room.socket handles room membership
  socket.on('disconnect', () => {
    // We don't have the roomId directly on disconnect unless we track it
    // For simplicity, we can loop rooms or store socket.id -> roomId mapping
    // A mapping approach in RoomService is better, but this works for testing
    let leftRoomId = null;
    
    // Find which room the socket was in
    for (const [roomId, room] of (roomService as any).rooms.entries()) {
      if (room.getPlayer(socket.id)) {
        leftRoomId = roomId;
        break;
      }
    }

    if (leftRoomId) {
      const updatedRoom = roomService.leaveRoom(leftRoomId, socket.id);
      if (updatedRoom) {
        updatedRoom.broadcastState(io, SocketEvents.PLAYER_LEFT);
      }
    }
  });
};
