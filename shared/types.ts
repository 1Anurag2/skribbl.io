import { Player } from './interfaces';

export type Point = { x: number; y: number };

export type StrokeData = {
  start: Point;
  end: Point;
  color: string;
  size: number;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  isSystem: boolean;
  isCorrectGuess?: boolean;
};

export type GameScoreInfo = {
  playerId: string;
  score: number;
};
