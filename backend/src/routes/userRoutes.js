// backend/src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware'); 
const { 
    getUserProfile, 
    updateUserProfile, 
    getUserById,
    followUser,
   
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory
} = require('../controllers/userController');

// 1. Получить СВОЙ профиль (теперь возвращает и историю)
router.get('/profile', protect, getUserProfile);

// 2. Обновить СВОЙ профиль
router.put('/profile', protect, updateUserProfile);

//  УПРАВЛЕНИЕ ИСТОРИЕЙ ПОИСКА
router.put('/search', protect, addToSearchHistory);          // Добавить
router.put('/search/remove', protect, removeFromSearchHistory); // Удалить одного
router.delete('/search', protect, clearSearchHistory);       // Очистить всё

// 3. Подписаться / Отписаться
router.put('/:id/follow', protect, followUser);

// 4. Получить ЧУЖОЙ профиль по ID (всегда внизу, чтобы не перехватывал 'profile' или 'search')
router.get('/:id', protect, getUserById); 

module.exports = router;