// backend/src/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const { addComment, toggleLikeComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

// Добавление комментария
router.post('/', protect, addComment);

// Лайк комментария: /api/comments/:id/like
router.put('/:id/like', protect, toggleLikeComment);

// 2. УДАЛЕНИЕ КОММЕНТАРИЯ
router.delete('/:commentId', protect, deleteComment);

module.exports = router;