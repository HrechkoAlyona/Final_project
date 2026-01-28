const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

// Отправить сообщение (POST /api/messages)
router.post('/', protect, sendMessage);

// Получить историю чата с конкретным пользователем (GET /api/messages/:userId)
router.get('/:userId', protect, getMessages);

module.exports = router;