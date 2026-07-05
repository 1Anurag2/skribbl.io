# Skribbl.io Clone

A full-stack, real-time multiplayer drawing and guessing game built as a clone of skribbl.io. 
This project features an OOP-based WebSocket server, real-time canvas synchronization, custom rooms, and dynamic game loops.

## Live Deployment
- **Live URL**: [https://your-skribbl-clone.onrender.com](https://your-skribbl-clone.onrender.com) *(Update with your actual deployment URL)*

## Features
- **Multiplayer Rooms**: Create private rooms with custom settings (draw time, rounds, etc.) or join via code.
- **Real-Time Drawing**: HTML5 Canvas strokes synchronized in real-time to all clients.
- **Turn-based Logic**: Rotates drawers, assigns words, and tracks game state automatically.
- **Progressive Hints**: Words are masked (e.g. `_ _ _ _`) and letters are progressively revealed over time.
- **Scoring System**: Fast guessers get more points. Drawers get points when others guess correctly.
- **Drawing Tools**: Colors, brush sizes, undo, clear, and an eraser tool.
- **Custom Words**: Hosts can inject their own word pools or use them exclusively.
- **Anti-Cheat**: Target words are only sent to the drawer; other clients receive masked data.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, TypeScript
- **Real-time**: Socket.IO

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
The server will start on `http://localhost:5000`

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The client will start on `http://localhost:5173`

---

## Architecture Overview

### WebSocket Object-Oriented Design (Server)
The backend is structured using Object-Oriented Principles (OOP) to cleanly encapsulate game state and socket behavior:

- **`RoomService` & `GameService`**: Singleton managers that handle lifecycle events (creating rooms, joining players, handling disconnects, and routing guesses).
- **`Room` Class**: Represents a lobby. Maintains the `RoomSettings`, a Map of `Player` objects, and the current `GamePhase` (Lobby, Word Selection, Drawing, etc.).
- **`Game` Class**: Manages the actual game loop. It handles the countdown timer, word selection, progressive hint generation, and turn rotation (`nextDrawer`).
- **`Player` Class**: Encapsulates participant data (score, avatar, socket ID, drawer status, correct guess status).

### Real-Time Canvas Sync
The drawing system uses the HTML5 `<canvas>` API combined with Socket.IO for minimal latency.
- When the drawer clicks and drags, `useCanvas.ts` calculates the local `x, y` coordinates.
- It immediately draws the stroke locally for zero latency, and emits a `DRAW_START` or `DRAW_MOVE` event with the coordinates, color, and brush size.
- The server broadcasts this event to everyone else in the room.
- Other clients receive the event and mirror the exact stroke on their own canvas using the incoming color and size parameters.

### State Synchronization
Instead of individually managing 100 tiny states, the server acts as the single source of truth. Whenever a significant event happens (player joins, settings change, game starts, round ends), the server calls `room.broadcastState(io)`.
This sends the entire `RoomState` object to all clients.
**Anti-Cheat**: `Room.ts` uses `getRoomStateForPlayer(playerId)` to scrub sensitive data (like the `currentWord`) before sending it to non-drawing clients.

---

## WebSocket Events Dictionary

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `CREATE_ROOM` | Client -> Server | `{ roomId, playerName, avatar }` | Creates a new room and joins as host |
| `JOIN_ROOM` | Client -> Server | `{ roomId, playerName, avatar }` | Joins an existing room |
| `PLAYER_JOINED` | Server -> Clients | `RoomState` | Broadcasts updated state when a player joins |
| `PLAYER_LEFT` | Server -> Clients | `RoomState` | Broadcasts updated state when a player leaves |
| `UPDATE_SETTINGS` | Client -> Server | `{ roomId, settings }` | Host updates the lobby settings |
| `START_GAME` | Client -> Server | `{ roomId }` | Host starts the game from the lobby |
| `WORD_OPTIONS` | Server -> Client | `{ words: string[] }` | Sends 3-5 word choices exclusively to the drawer |
| `WORD_SELECTED` | Client -> Server | `{ word: string }` | Drawer selects a word; starts the round timer |
| `DRAW_START` | Client -> Server | `{ start: Point, end: Point, color, size }` | Emitted when drawer begins a new stroke |
| `DRAW_MOVE` | Client -> Server | `{ x, y }` | Emitted when drawer drags the mouse |
| `GUESS` | Client -> Server | `{ text, playerName }` | A player types a message or guess |
| `CHAT_MESSAGE` | Server -> Clients | `ChatMessage` | Broadcasts the guess or a system notification |
| `SCORES_UPDATED`| Server -> Clients | `RoomState` | Sent when someone guesses correctly to update leaderboard |
| `HINT_REVEALED` | Server -> Clients | `RoomState` | Sent when the timer reveals a new letter in the hint |
| `ROUND_END` | Server -> Clients | `RoomState` | The round concludes (time up or all guessed) |
| `GAME_OVER` | Server -> Clients | `RoomState` | All rounds are finished; shows the podium |

## Deployment Guide (Render)

1. Create a Web Service on Render for the **Server**. 
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start` (Make sure your `package.json` has `"start": "node dist/server.js"`)
2. Create a Static Site on Render for the **Client**.
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
3. Update `client/src/context/SocketContext.tsx` to point `io()` to your deployed backend URL.
