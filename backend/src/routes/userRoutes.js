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
    clearSearchHistory,
    getUserFollowers,
    getUserFollowing
} = require('../controllers/userController');

router.get('/profile', protect, getUserProfile); // 1. Получить СВОЙ профиль
router.put('/profile', protect, updateUserProfile); // 2. Обновить СВОЙ профиль
router.put('/search', protect, addToSearchHistory);    // 3. УПРАВЛЕНИЕ ИСТОРИЕЙ ПОИСКА      // Добавить
router.put('/search/remove', protect, removeFromSearchHistory); // Удалить одного
router.delete('/search', protect, clearSearchHistory);       // Очистить всё
router.put('/:id/follow', protect, followUser); // 4. Подписаться / Отписаться
router.get('/:id/followers', protect, getUserFollowers); // 5. ПОЛУЧИТЬ СПИСКИ (Подписчики и Подписки)
router.get('/:id/following', protect, getUserFollowing);
router.get('/:id', protect, getUserById); // 6. Получить ЧУЖОЙ профиль по ID (всегда в самом низу!)

module.exports = router;