require('dotenv').config(); // Всегда в самом верху
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // 1 Импортируем подключение к БД
const commentRoutes = require('./routes/commentRoutes');

const app = express(); //  Инициализируем приложение


connectDB(); // 2. Запускаем подключение. одключаемся к MongoDB Atlas

// Мидлвары
app.use(cors());
app.use(express.json()); 

// (Подключаем) импортируем маршруты
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const likeRoutes = require('./routes/likeRoutes');


//  Используем маршруты
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);

const PORT = process.env.PORT || 5005;

app.get('/', (req, res) => {
    res.send('Сервер и База Данных работают!');
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});