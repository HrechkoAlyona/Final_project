require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Импорт маршрутов
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const likeRoutes = require('./routes/likeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const followRoutes = require('./routes/followRoutes');
const searchRoutes = require('./routes/searchRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); 
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const server = http.createServer(app);

// Инициализация Socket.io
const io = new Server(server, {
    cors: { 
        origin: "*", 
        methods: ["GET", "POST"] 
    },
    allowEIO3: true
});

// Логика Socket.io
io.on('connection', (socket) => {
    console.log('ПОДКЛЮЧЕНИЕ УСТАНОВЛЕНО', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`Пользователь вошел в комнату: ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log('Пользователь отключился');
    });
});

// Делаем io доступным в контроллерах
app.set('io', io);

// Подключение к БД
connectDB();

// Мидлвары
app.use(cors());
app.use(express.json());

// Использование маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes); 
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
    res.send('Сервер и База Данных работают! Socket.io готов.');
});

const PORT = process.env.PORT || 5005;
server.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));