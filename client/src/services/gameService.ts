import { Socket } from 'socket.io-client';
import { SocketEvents } from '../types';

class GameService {
  public kickPlayer(socket: Socket | null, roomId: string, targetId: string) {
    if (socket) {
      socket.emit(SocketEvents.KICK_PLAYER, { roomId, targetId });
    }
  }

  public startVotekick(socket: Socket | null, roomId: string, targetId: string, targetName: string) {
    if (socket) {
      socket.emit(SocketEvents.VOTEKICK_START, { roomId, targetId, targetName });
    }
  }

  public castVote(socket: Socket | null, roomId: string, vote: 'yes' | 'no') {
    if (socket) {
      socket.emit(SocketEvents.VOTEKICK_VOTE, { roomId, vote });
    }
  }

  public sendChatMessage(socket: Socket | null, roomId: string, text: string) {
    if (socket) {
      socket.emit(SocketEvents.CHAT_MESSAGE, { roomId, text });
    }
  }

  public sendGuess(socket: Socket | null, text: string, playerName?: string) {
    if (socket) {
      socket.emit(SocketEvents.GUESS, { text, playerName });
    }
  }

  public createRoom(socket: Socket | null, roomId: string, playerName: string, avatar: string) {
    if (socket) {
      socket.emit(SocketEvents.CREATE_ROOM, { roomId, playerName, avatar });
    }
  }

  public joinRoom(socket: Socket | null, roomId: string, playerName: string, avatar: string) {
    if (socket) {
      socket.emit(SocketEvents.JOIN_ROOM, { roomId, playerName, avatar });
    }
  }

  public playPublic(socket: Socket | null, playerName: string, avatar: string) {
    if (socket) {
      socket.emit(SocketEvents.PLAY_PUBLIC, { playerName, avatar });
    }
  }

  public updateSettings(socket: Socket | null, roomId: string, settings: any) {
    if (socket) {
      socket.emit(SocketEvents.UPDATE_SETTINGS, { roomId, settings });
    }
  }
}

export const gameService = new GameService();
