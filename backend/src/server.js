// backend/src/server.js
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const initializeSocket = require('./socket/index');

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const followRoutes = require('./routes/followRoutes');
const searchRoutes = require('./routes/searchRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); 
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);

connectDB(); // Подключение к БД
// Мидлвары
app.use(cors());
app.use(express.json());
// Инициализация Socket.io
const io = initializeSocket(server);
app.set('io', io); // Чтобы использовать io в контроллерах (на всякий случай)
// Использование маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes); 
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes); 

app.use('/api/messages', messageRoutes); 

const PORT = process.env.PORT || 5005;
server.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));