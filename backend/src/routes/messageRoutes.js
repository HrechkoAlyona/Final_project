// backend/src/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { 
    sendMessage, 
    getMessages, 
    getConversations, 
    markMessagesAsRead,
    deleteMessage // Импортируем новую функцию
} = require('../controllers/messageController');

router.get('/conversations', protect, getConversations); // 1. Получить список диалогов (статический путь)
router.post('/', protect, sendMessage); // 2. Отправить сообщение
router.put('/read/:id', protect, markMessagesAsRead); // 3. Пометить как прочитанное
router.delete('/:id', protect, deleteMessage); // 4. Удалить сообщение
router.get('/:id', protect, getMessages); // 5. Получить историю переписки (динамический путь с ID)

module.exports = router;