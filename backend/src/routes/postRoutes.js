// backend\src\routes\postRoutes.js
const express = require('express');
const router = express.Router();

const { createPost, getPosts, getMyPosts, deletePost, updatePost } = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createPost);
router.get('/', protect, getPosts); // Теперь поддерживает ?type=...
router.get('/my', protect, getMyPosts); // Для страницы профиля
router.put('/:id', protect, updatePost);    // Редактировать (например, PUT /api/posts/ID_ПОСТА)
router.delete('/:id', protect, deletePost); // Удалить (например, DELETE /api/posts/ID_ПОСТА)

module.exports = router;

