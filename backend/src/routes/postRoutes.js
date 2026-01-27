const express = require('express');
const router = express.Router();
const { createPost, getPosts } = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createPost); // Только для авторизованных
router.get('/', getPosts); // Посмотреть могут все

module.exports = router;