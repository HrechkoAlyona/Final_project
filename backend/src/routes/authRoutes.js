// backend\src\routes\authRoutes.js

const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    requestPasswordReset,
    resetPasswordStep2
} = require('../controllers/authController');

// 1. РЕГИСТРАЦИЯ
router.post('/register', registerUser);

// 2. ВХОД
router.post('/login', loginUser);

// 3. СБРОС ПАРОЛЯ
router.post('/reset-password', requestPasswordReset);
router.post('/reset-password/step2', resetPasswordStep2);

module.exports = router;