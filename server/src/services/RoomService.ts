import { Room } from '../models/Room';
import { Player } from '../models/Player';
import { RoomSettings } from '../../../shared/interfaces';
import { GameConstants } from '../../../shared/constants';

class RoomService {
  private rooms: Map<string, Room> = new Map();

  createRoom(roomId: string, hostId: string, hostName: string, avatar: string, isPrivate: boolean = true): Room {
    const settings: RoomSettings = {
      maxPlayers: GameConstants.MAX_PLAYERS,
      rounds: GameConstants.DEFAULT_ROUNDS,
      drawTime: GameConstants.DEFAULT_DRAW_TIME,
      wordCount: 3,
      language: 'English',
      category: 'All',
      gameMode: 'Normal',
      hintsCount: 2,
      customWords: '',
      useCustomWordsOnly: false,
      isPrivate,
    };
    
    const room = new Room(roomId, hostId, settings);
    this.rooms.set(roomId, room);
    
    // Add host as first player
    this.joinRoom(roomId, hostId, hostName, avatar);
    
    return room;
  }

  findOrCreatePublicRoom(playerId: string, playerName: string, avatar: string): Room {
    // Look for an existing public room that isn't full
    for (const room of Array.from(this.rooms.values())) {
      if (!room.settings.isPrivate && room.getPlayersList().length < room.settings.maxPlayers) {
        this.joinRoom(room.roomId, playerId, playerName, avatar);
        return room;
      }
    }
    
    // No public room found, create a new one
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    return this.createRoom(newRoomId, playerId, playerName, avatar, false);
  }

  joinRoom(roomId: string, playerId: string, playerName: string, avatar: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const newPlayer = new Player(playerId, playerName, avatar);
    if (room.addPlayer(newPlayer)) {
      return room;
    }
    return null; // Room full
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  leaveRoom(roomId: string, playerId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.removePlayer(playerId);
    
    if (room.getPlayersList().length === 0) {
      this.rooms.delete(roomId);
      return null;
    }
    
    // If host left, reassign host
    if (room.hostId === playerId) {
      room.hostId = room.getPlayersList()[0].id;
    }
    
    return room;
  }
}

export const roomService = new RoomService();
