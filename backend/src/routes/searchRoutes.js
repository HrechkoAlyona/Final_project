// backend/src/routes/searchRoutes.js

const express = require('express');
const router = express.Router();
const { searchUsers } = require('../controllers/searchController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, searchUsers);// Добавляем protect, чтобы знать, КТО ищет (для статуса подписки)

module.exports = router;