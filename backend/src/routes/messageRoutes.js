// backend\src\router\messageRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { sendMessage, getMessages, getConversations } = require('../controllers/messageController');

// 1. Список диалогов (СТРОГО ВВЕРХУ)
router.get('/conversations', protect, getConversations);

// 2. Отправка сообщения
router.post('/', protect, sendMessage);

// 3. Получение переписки (СТРОГО ВНИЗУ, так как :id перехватывает всё)
router.get('/:id', protect, getMessages);

module.exports = router;