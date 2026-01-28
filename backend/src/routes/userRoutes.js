const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// Получить свои данные
router.get('/profile', protect, getUserProfile);

// Обновить свои данные. Путь для обновления профиля (защищен токеном)
router.put('/profile', protect, updateUserProfile);

module.exports = router;