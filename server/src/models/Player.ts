import { Player as IPlayer } from '../../../shared/interfaces';

export class Player implements IPlayer {
  id: string;
  name: string;
  score: number;
  isDrawer: boolean;
  hasGuessedCorrectly: boolean;
  avatar: string;

  constructor(id: string, name: string, avatar: string) {
    this.id = id;
    this.name = name;
    this.score = 0;
    this.isDrawer = false;
    this.hasGuessedCorrectly = false;
    this.avatar = avatar;
  }

  addScore(points: number) {
    this.score += points;
  }

  resetForNewRound() {
    this.isDrawer = false;
    this.hasGuessedCorrectly = false;
  }
}
