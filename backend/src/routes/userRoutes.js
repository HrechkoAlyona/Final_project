// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware'); 
const { 
    getUserProfile, 
    updateUserProfile, 
    getUserById,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
    getUserFollowers,
    getUserFollowing
} = require('../controllers/userController');

// 1. СТАТИЧЕСКИЕ РОУТЫ (Всегда сверху)
// Получить свой профиль и обновить его
router.get('/profile', protect, getUserProfile); 
router.put('/profile', protect, updateUserProfile); 

// 2. ИСТОРИЯ ПОИСКА
router.put('/search', protect, addToSearchHistory);
router.put('/search/remove', protect, removeFromSearchHistory);
router.delete('/search', protect, clearSearchHistory);

// 3. СПИСКИ (ПОДПИСЧИКИ И ПОДПИСКИ)
router.get('/:id/followers', protect, getUserFollowers); 
router.get('/:id/following', protect, getUserFollowing);

// 4. ПОЛУЧЕНИЕ ПРОФИЛЯ ПО ID
// Всегда в самом низу, чтобы не перехватывать другие GET запросы
router.get('/:id', protect, getUserById); 

module.exports = router;