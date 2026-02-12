// backend\src\routes\notificationRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    getNotifications,
    markNotificationsAsRead
} = require('../controllers/notificationController');

// Получить список уведомлений
router.get('/', protect, getNotifications);

// Пометить все как прочитанные
router.put('/read', protect, markNotificationsAsRead);

module.exports = router;