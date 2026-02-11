// backend\src\routes\commentRoutes.js
const express = require('express');
const router = express.Router();
const { addComment, toggleLikeComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, addComment);
// Маршрут для лайка: /api/comments/:id/like
router.put('/:id/like', protect, toggleLikeComment); 

module.exports = router;