// Чтобы мы могли отправить данные с фронтенда на бэкенд

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware'); // Импортируем охранника

// Маршрут для регистрации: POST /api/auth/register
router.post('/register', registerUser);

// Маршрут для входа: POST /api/auth/login
router.post('/login', loginUser); 
// Только залогиненный пользователь сможет увидеть свой профиль
router.get('/profile', protect, getUserProfile);

module.exports = router;


