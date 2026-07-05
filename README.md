<div align="center">
  <h1>🎨 Skribbl.io Clone</h1>
  <p>A real-time multiplayer drawing and guessing game built from scratch.</p>
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
  [![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](#)
</div>

<br/>

## 🎯 What is this project?
This is a full-stack clone of the popular game [Skribbl.io](https://skribbl.io). I built this project to challenge myself with **real-time bi-directional communication** using WebSockets. 

In this game, players join a room, take turns drawing a given word on a shared canvas, and the others race against the clock to type the correct guess in the chat.

**Live Demo**: [https://your-skribbl-clone.vercel.app](https://your-skribbl-clone.vercel.app) *(Replace with your actual link)*

---

## 🎮 How it works (Core Functionalities)

Here is exactly what you can do in this app:

1. **Create or Join Private Rooms**
   - You can create a private lobby and invite your friends using a unique Room ID.
   - The host has the power to configure the game: choose the number of rounds, set the drawing time limit, or even add custom words to the game.

2. **Real-Time Drawing & Syncing**
   - The core of the app is the drawing canvas. When a player draws on their screen, the stroke coordinates are instantly captured and broadcasted to everyone else in the room with virtually zero latency.
   - It includes a full toolset: custom colors, different brush sizes, undo, clear canvas, and an eraser.

3. **Smart Game Loop & Turn Management**
   - The server automatically handles who is drawing next. 
   - It gives the drawer 3 random words to choose from. Once a word is picked, the timer starts.
   - For the people guessing, the word is hidden (e.g., `_ _ _ _ _`). As time runs out, the server automatically reveals random hint letters to help them out.

4. **Chat & Scoring System**
   - If a player types the exact word in the chat, the system detects it, hides the message from others, and awards points based on how fast they guessed.
   - **Whisper Chat (Anti-Spoiler):** Once a player guesses the word correctly, their subsequent chat messages are completely hidden from those who are still guessing. They can only chat with the drawer and other players who have already solved it!
   - The drawer also gets points if people successfully guess their drawing.

5. **Anti-Cheat Mechanism**
   - The actual word is strictly kept on the server and only sent to the current drawer. Other players only receive the masked version.

---

## 💻 Technologies Used

I chose a modern, type-safe tech stack to ensure the app is robust and easy to scale:

- **Frontend:** React, TypeScript, Vite, Tailwind CSS. (Deployed on Vercel)
- **Backend:** Node.js, Express, TypeScript. (Deployed on Render)
- **Real-Time Communication:** Socket.IO.
- **Graphics:** Native HTML5 `<canvas>` API for drawing.

---

## 🧠 Technical Highlights & Architecture
*(For the technical folks reviewing this repo)*

Building a real-time game is very different from a standard CRUD app. Here is how I approached the architecture:

- **Single Source of Truth:** Managing game state across multiple clients is tricky. Instead of letting the frontend guess what's happening, the Node.js server acts as the absolute boss. Whenever someone joins, a round ends, or a setting changes, the server broadcasts a unified `RoomState` object to sync everyone instantly.
- **Object-Oriented Backend:** To keep the codebase clean, I structured the backend using OOP. There are dedicated classes for `Room`, `Game`, and `Player`. This makes it incredibly easy to manage independent lobbies running simultaneously without their data leaking into each other.
- **Optimized Canvas Rendering:** To prevent lag while drawing, strokes are rendered locally *immediately*, while simultaneously firing a `DRAW_MOVE` event to the server to update the others. 

---

## 🚀 Run it locally

Want to test it out on your own machine? It's simple.

**Prerequisites:** You'll need Node.js installed on your computer.

**1. Start the Backend Server**
```bash
cd server
npm install
npm run dev
```
*The server will start on http://localhost:5000*

**2. Start the Frontend Client**
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
*The app will be running at http://localhost:5173*

---

> **Note to Recruiters:** I am actively looking for software engineering roles. If you found this project interesting, I'd love to chat! Feel free to reach out to me on [LinkedIn](https://linkedin.com/in/your-profile) or via email at your.email@example.com.
