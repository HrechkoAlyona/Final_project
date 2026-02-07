// backend\src\routes\searchRoutes.js

const express = require('express');
const router = express.Router();
const { searchUsers } = require('../controllers/searchController');

// Поиск обычно открыт для всех, поэтому protect можно не ставить
router.get('/', searchUsers);

module.exports = router;