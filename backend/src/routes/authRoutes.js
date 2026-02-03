const express = require('express');
const router = express.Router();

// 1. Импортируем функции из контроллера (добавили requestPasswordReset и resetPasswordStep2)
const { 
    registerUser, 
    loginUser, 
    getUserProfile,
    requestPasswordReset, 
    resetPasswordStep2 
} = require('../controllers/authController');

const { protect } = require('../middlewares/authMiddleware'); // Охранник

// ==========================
// МАРШРУТЫ (ROUTES)
// ==========================

// Регистрация: POST /api/auth/register
router.post('/register', registerUser);

// Вход: POST /api/auth/login
router.post('/login', loginUser);

// Профиль (защищенный): GET /api/auth/profile
router.get('/profile', protect, getUserProfile);

// --- СБРОС ПАРОЛЯ (RESET PASSWORD) ---

// Шаг 1: Запрос кода на email (или в консоль)
router.post('/reset-password', requestPasswordReset);

// Шаг 2: Ввод кода и нового пароля
router.post('/reset-password/step2', resetPasswordStep2);

module.exports = router;

