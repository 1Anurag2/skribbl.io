import { Server } from 'socket.io';
import { SocketEvents } from '../../../shared/events';
import { GamePhase } from '../../../shared/enums';
import { roomService } from './RoomService';

class GameService {
  startGame(io: Server, roomId: string) {
    const room = roomService.getRoom(roomId);
    if (!room) return;
    
    room.startGame(); // Changes state to WORD_SELECTION and creates Game instance
    
    this.startRound(io, roomId);
  }

  startRound(io: Server, roomId: string) {
    const room = roomService.getRoom(roomId);
    if (!room || !room.game) return;

    const gameContinues = room.game.startNextRound(
      // On Word Options generated
      (drawerId, words) => {
        // Send state to everyone
        room.broadcastState(io, SocketEvents.START_GAME);
        
        // Send word options ONLY to the drawer
        io.to(drawerId).emit('WORD_OPTIONS', { words });
      },
      // On Round End naturally
      () => this.endRound(io, roomId)
    );

    if (!gameContinues) {
      room.broadcastState(io, SocketEvents.GAME_OVER);
    }
  }

  chooseWord(io: Server, roomId: string, word: string) {
    const room = roomService.getRoom(roomId);
    if (!room || !room.game) return;

    room.game.chooseWord(
      word,
      // Timer tick
      (time) => io.to(roomId).emit('TIMER_TICK', { time }),
      // Timer up
      () => this.endRound(io, roomId),
      // Hint Reveal
      (hints) => room.broadcastState(io, 'HINT_REVEALED')
    );

    // Notify room that drawing has started
    room.broadcastState(io, 'WORD_SELECTED');
  }

  endRound(io: Server, roomId: string) {
    const room = roomService.getRoom(roomId);
    if (!room || !room.game) return;

    room.game.endRound();
    // During ROUND_END we want everyone to see the word, so getRoomStateForPlayer will show it
    room.broadcastState(io, SocketEvents.ROUND_END);

    // Automatically start next round after 5 seconds
    setTimeout(() => {
      this.startRound(io, roomId);
    }, 5000);
  }

  handleGuess(io: Server, roomId: string, playerId: string, guess: string): boolean {
    const room = roomService.getRoom(roomId);
    if (!room || !room.game || room.gamePhase !== GamePhase.DRAWING) return false;

    const player = room.getPlayer(playerId);
    if (!player || player.isDrawer || player.hasGuessedCorrectly) {
      // Just a normal chat message if they are drawer or already guessed
      return false; 
    }

    // Basic guess validation (case-insensitive)
    if (guess.toLowerCase() === room.game.currentWord.toLowerCase()) {
      player.hasGuessedCorrectly = true;
      
      // Calculate score based on time remaining
      const points = Math.max(10, Math.floor((room.game.timer / room.settings.drawTime) * 100));
      player.addScore(points);

      // Award points to drawer as well
      const drawer = room.getPlayersList().find(p => p.isDrawer);
      if (drawer) {
        drawer.addScore(20); // Flat points for drawer per correct guess
      }

      // Check if everyone guessed correctly
      const guessers = room.getPlayersList().filter(p => !p.isDrawer);
      const allGuessed = guessers.every(p => p.hasGuessedCorrectly);

      if (allGuessed) {
        this.endRound(io, roomId);
      }

      return true;
    }
    
    return false;
  }
}

export const gameService = new GameService();
