// backend\src\socket\index.js

const { Server } = require('socket.io');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      // РАЗРЕШАЕМ И LOCALHOST, И IP 127.0.0.1
      origin: [
        "http://localhost:5173", 
        "http://127.0.0.1:5173"
      ],
      methods: ["GET", "POST"],
      credentials: true // Разрешаем куки и заголовки авторизации (важно!)
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // 1. Вход в комнату (Ключевой момент для уведомлений)
    socket.on('join', (userId) => {
      if (userId) {
        // Приводим к строке, чтобы ID всегда был корректным именем комнаты
        const roomName = String(userId);
        socket.join(roomName);
        console.log(`✅ User ${userId} joined room: ${roomName}`);
      }
    });

    // Обработка ошибок
    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id); // для отладки
    });
  });

  return io;
};

module.exports = initializeSocket;