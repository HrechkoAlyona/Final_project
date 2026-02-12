// backend\src\routes\messageRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
    sendMessage, 
    getMessages, 
    getConversations, 
    markMessagesAsRead // Импортируем новую функцию
} = require('../controllers/messageController');

// 1. Список диалогов
router.get('/conversations', protect, getConversations);

// 2. Отправка сообщения
router.post('/', protect, sendMessage);

// 3. Пометить как прочитанное (СТАВИМ ПЕРЕД /:id)
// Этот маршрут будет ловить запросы вида /api/messages/read/USER_ID
router.put('/read/:id', protect, markMessagesAsRead); 

// 4. Получение переписки (ЭТОТ ДОЛЖЕН БЫТЬ ПОСЛЕДНИМ для GET запросов с ID)
router.get('/:id', protect, getMessages);

module.exports = router;