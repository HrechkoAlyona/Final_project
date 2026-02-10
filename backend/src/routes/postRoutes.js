// backend/src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middlewares/authMiddleware');

const { 
  createPost, 
  getPosts, 
  getExplorePosts, 
  getMyPosts, 
  deletePost, 
  updatePost, 
  getPostById,
  toggleLike,
  addComment // <--- 1. Импортировали
} = require('../controllers/postController');

const upload = multer({ storage: multer.memoryStorage() });

// --- МАРШРУТЫ ---

// Создание
router.post('/', protect, upload.single('image'), createPost);

// Списки
router.get('/', protect, getPosts); 
router.get('/followed', protect, getPosts); 
router.get('/explore', protect, getExplorePosts); 
router.get('/my', protect, getMyPosts); 

// Операции с ID
router.get('/:id', protect, getPostById);
router.put('/:id', protect, updatePost); 
router.delete('/:id', protect, deletePost); 

// Лайк
router.put('/:id/like', protect, toggleLike);

// КОММЕНТАРИЙ 
router.post('/:id/comment', protect, addComment);

module.exports = router;