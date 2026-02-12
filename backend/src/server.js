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

//  МИДЛВАРЫ 
app.use(cors());

// Увеличиваем лимит до 50MB для загрузки картинок
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Инициализация Socket.io
const io = initializeSocket(server);
app.set('io', io); // Чтобы использовать io в контроллерах

// Использование маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);

//  ГЛОБАЛЬНАЯ ОБРАБОТКА ОШИБОК Global Error Handler 

// 1. Если маршрут не найден (404)
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// 2. Обработчик всех ошибок (Middleware)
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        // Стек ошибки показываем только в режиме разработки
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5005;
server.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));