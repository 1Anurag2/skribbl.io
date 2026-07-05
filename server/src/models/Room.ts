import { GamePhase } from '../../../shared/enums';
import { RoomSettings, RoomState } from '../../../shared/interfaces';
import { Player } from './Player';
import { Game } from './Game';
import { Server } from 'socket.io';

export class Room {
  roomId: string;
  hostId: string;
  players: Map<string, Player>;
  settings: RoomSettings;
  gamePhase: GamePhase;
  game: Game | null;
  bannedPlayers: Set<string>;
  activeVotekick: { targetId: string; targetName: string; votesYes: Set<string>; votesNo: Set<string>; timer: NodeJS.Timeout } | null;

  constructor(roomId: string, hostId: string, settings: RoomSettings) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.players = new Map();
    this.settings = settings;
    this.gamePhase = GamePhase.LOBBY;
    this.game = null;
    this.bannedPlayers = new Set();
    this.activeVotekick = null;
  }

  addPlayer(player: Player) {
    if (this.bannedPlayers.has(player.id)) return false; // Banned
    if (this.players.size < this.settings.maxPlayers) {
      this.players.set(player.id, player);
      return true;
    }
    return false;
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
    // If host leaves, assign new host or destroy room (handled in service)
  }

  getPlayer(playerId: string) {
    return this.players.get(playerId);
  }

  getPlayersList(): Player[] {
    return Array.from(this.players.values());
  }

  startGame() {
    this.gamePhase = GamePhase.WORD_SELECTION;
    this.game = new Game(this);
  }

  updateSettings(newSettings: Partial<RoomSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  getRoomStateForPlayer(playerId?: string): RoomState {
    const players = this.getPlayersList();
    const currentDrawer = this.game && this.game.drawerIndex >= 0 ? players[this.game.drawerIndex] : null;
    const isDrawer = playerId && currentDrawer ? currentDrawer.id === playerId : false;
    const hideWord = this.gamePhase === GamePhase.DRAWING && !isDrawer;

    return {
      roomId: this.roomId,
      hostId: this.hostId,
      players: this.getPlayersList(),
      settings: this.settings,
      gamePhase: this.gamePhase,
      currentRound: this.game ? this.game.currentRound : 0,
      currentWord: this.game ? (hideWord ? '' : this.game.currentWord) : '',
      hints: this.game ? this.game.hints : '',
      timer: this.game ? this.game.timer : 0,
    };
  }

  broadcastState(io: Server, eventName: string) {
    this.players.forEach(p => {
      io.to(p.id).emit(eventName, this.getRoomStateForPlayer(p.id));
    });
  }
}
