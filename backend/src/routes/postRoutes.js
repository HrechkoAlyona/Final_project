// backend/src/routes/postRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer'); 

// 1. Импортируем контроллеры постов (добавили getPostById)
const { 
    createPost, 
    getPosts, 
    getMyPosts, 
    deletePost, 
    updatePost,
    getPostById // 🔥 ИМПОРТ НОВОЙ ФУНКЦИИ
} = require('../controllers/postController');

// 2. Импортируем контроллер лайков
const { likePost } = require('../controllers/likeController');

const { protect } = require('../middlewares/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// --- МАРШРУТЫ ---

// Создать пост
router.post('/', protect, upload.single('image'), createPost);

// Получить ленту
router.get('/', protect, getPosts); 

// Получить мои посты (ВАЖНО: этот маршрут должен быть ПЕРЕД '/:id')
router.get('/my', protect, getMyPosts); 

// 🔥 НОВЫЙ МАРШРУТ: Получить один пост по ID
router.get('/:id', protect, getPostById);

// Обновить и Удалить
router.put('/:id', protect, updatePost); 
router.delete('/:id', protect, deletePost); 

// Лайкнуть пост
router.put('/:id/like', protect, likePost);

module.exports = router;