import { GamePhase } from '../../../shared/enums';
import { Room } from './Room';
import * as fs from 'fs';
import * as path from 'path';

export class Game {
  room: Room;
  currentRound: number;
  currentWord: string;
  hints: string;
  timer: number;
  drawerIndex: number;
  timerInterval: NodeJS.Timeout | null = null;
  currentWordOptions: string[] = [];
  unrevealedIndices: number[] = [];
  
  constructor(room: Room) {
    this.room = room;
    this.currentRound = 0;
    this.currentWord = '';
    this.hints = '';
    this.timer = this.room.settings.drawTime;
    this.drawerIndex = -1;
  }

  startNextRound(wordOptionsCallback: (drawerId: string, words: string[]) => void, roundEndCallback: () => void) {
    this.currentRound++;
    if (this.currentRound > this.room.settings.rounds) {
      this.room.gamePhase = GamePhase.GAME_OVER;
      return false; // Game is over
    }
    
    // Reset players for new round
    this.room.getPlayersList().forEach(p => p.resetForNewRound());

    this.nextDrawer();
    this.room.gamePhase = GamePhase.WORD_SELECTION;
    
    let defaultWords: string[] = ['apple', 'car', 'tree', 'sun', 'house', 'banana', 'cat', 'dog', 'computer', 'mouse', 'keyboard', 'phone'];
    try {
      const wordsPath = path.join(__dirname, '..', 'data', 'words.json');
      const wordsData = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));
      
      const lang = this.room.settings.language || 'English';
      const cat = this.room.settings.category || 'All';
      
      if (wordsData[lang] && wordsData[lang][cat]) {
        defaultWords = wordsData[lang][cat];
      } else if (wordsData[lang] && wordsData[lang]['All']) {
        defaultWords = wordsData[lang]['All'];
      }
    } catch (e) {
      console.error('Failed to load words.json', e);
    }

    let customWordsList: string[] = [];
    if (this.room.settings.customWords && this.room.settings.customWords.trim().length > 0) {
      customWordsList = this.room.settings.customWords.split(',').map(w => w.trim()).filter(w => w.length > 0);
    }
    
    let wordsPool: string[] = [];
    
    if (this.room.settings.useCustomWordsOnly && customWordsList.length >= this.room.settings.wordCount) {
      wordsPool = [...customWordsList];
    } else {
      wordsPool = [...defaultWords, ...customWordsList];
    }

    // Shuffle pool
    wordsPool.sort(() => Math.random() - 0.5);
    
    const drawerId = this.room.getPlayersList()[this.drawerIndex].id;
    this.currentWordOptions = wordsPool.slice(0, this.room.settings.wordCount);
    
    wordOptionsCallback(drawerId, this.currentWordOptions);
    return true;
  }

  nextDrawer() {
    const players = this.room.getPlayersList();
    if (players.length === 0) return;
    
    if (this.drawerIndex >= 0 && this.drawerIndex < players.length) {
      players[this.drawerIndex].isDrawer = false;
    }

    this.drawerIndex = (this.drawerIndex + 1) % players.length;
    players[this.drawerIndex].isDrawer = true;
  }

  chooseWord(word: string, onTimerTick: (time: number) => void, onTimeUp: () => void, onHintReveal: (hints: string) => void) {
    this.currentWord = word;
    this.hints = word.replace(/[a-zA-Z]/g, '_'); // Basic hint generation
    this.unrevealedIndices = [];
    for (let i = 0; i < word.length; i++) {
      if (word[i].match(/[a-zA-Z]/)) this.unrevealedIndices.push(i);
    }
    // Shuffle the indices
    this.unrevealedIndices.sort(() => Math.random() - 0.5);
    
    this.room.gamePhase = GamePhase.DRAWING;
    this.startTimer(onTimerTick, onTimeUp, onHintReveal);
  }

  startTimer(onTimerTick: (time: number) => void, onTimeUp: () => void, onHintReveal?: (hints: string) => void) {
    this.timer = this.room.settings.drawTime;
    const totalTime = this.room.settings.drawTime;
    const hintsCount = Math.min(this.room.settings.hintsCount || 0, this.unrevealedIndices.length - 1); // leave at least 1 blank
    
    const hintTimes: number[] = [];
    for (let i = 1; i <= hintsCount; i++) {
      hintTimes.push(Math.floor(totalTime * (1 - i / (hintsCount + 1))));
    }
    
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      this.timer--;
      onTimerTick(this.timer);
      
      if (hintTimes.includes(this.timer) && this.unrevealedIndices.length > 0) {
        const idx = this.unrevealedIndices.pop();
        if (idx !== undefined) {
          const chars = this.hints.split('');
          chars[idx] = this.currentWord[idx];
          this.hints = chars.join('');
          if (onHintReveal) onHintReveal(this.hints);
        }
      }
      
      if (this.timer <= 0) {
        this.stopTimer();
        onTimeUp();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  endRound() {
    this.stopTimer();
    this.room.gamePhase = GamePhase.ROUND_END;
    this.currentWord = '';
  }
}
