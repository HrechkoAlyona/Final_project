// backend/src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middlewares/authMiddleware');

// Импортируем всё необходимое из ОДНОГО контроллера
const { 
  createPost, 
  getPosts, 
  getExplorePosts, 
  getMyPosts, 
  deletePost, 
  updatePost, 
  getPostById,
  toggleLike 
} = require('../controllers/postController');

const upload = multer({ storage: multer.memoryStorage() });

// --- МАРШРУТЫ ---

// Создание поста
router.post('/', protect, upload.single('image'), createPost);

// Списки постов (важно: они должны быть ВЫШЕ, чем /:id)
router.get('/', protect, getPosts); 
router.get('/followed', protect, getPosts); 
router.get('/explore', protect, getExplorePosts); 
router.get('/my', protect, getMyPosts); 

// Операции с конкретным постом по ID
router.get('/:id', protect, getPostById);
router.put('/:id', protect, updatePost); 
router.delete('/:id', protect, deletePost); 

// Лайк (используем toggleLike из postController)
router.put('/:id/like', protect, toggleLike);

module.exports = router;