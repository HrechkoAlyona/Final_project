// backend\src\socket\index.js

const { Server } = require('socket.io');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Адрес фронтенда
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);
    // 1. Вход в комнату
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`✅ User ${userId} joined room ${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = initializeSocket;