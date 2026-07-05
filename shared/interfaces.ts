import { GamePhase } from './enums';

export interface Player {
  id: string; // Socket ID
  name: string;
  score: number;
  isDrawer: boolean;
  hasGuessedCorrectly: boolean;
  avatar: string;
}

export interface RoomSettings {
  maxPlayers: number;
  rounds: number;
  drawTime: number; // in seconds
  wordCount: number; // choices for drawer
  language: string;
  category: string;
  gameMode: string;
  hintsCount: number;
  customWords: string;
  useCustomWordsOnly: boolean;
  isPrivate: boolean;
}

export interface RoomState {
  roomId: string;
  hostId: string;
  players: Player[];
  settings: RoomSettings;
  gamePhase: GamePhase;
  currentRound: number;
  currentWord: string;
  hints: string; // "A _ p l _"
  timer: number;
}
