import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { registerRoomEvents } from './socket/room.socket';
import { registerDrawEvents } from './socket/draw.socket';
import { registerChatEvents } from './socket/chat.socket';
import { registerGameEvents } from './socket/game.socket';
import { config } from './config';
import { logger } from './utils/logger';
import healthRoutes from './routes/health.routes';
import categoryRoutes from './routes/category.routes';

const app = express();
const httpServer = createServer(app);

app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true
}));
app.use(express.json());

// Socket.io initialization
const io = new Server(httpServer, {
  cors: {
    origin: config.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  registerRoomEvents(io, socket);
  registerDrawEvents(io, socket);
  registerChatEvents(io, socket);
  registerGameEvents(io, socket);

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
    // Logic for disconnecting user will be handled in RoomService
  });
});

// REST API Routes
app.use('/api/health', healthRoutes);
app.use('/api/categories', categoryRoutes);

export { app, httpServer, io };
