// backend\src\routes\likeRoutes.js

const express = require('express');
const router = express.Router();
const { likePost } = require('../controllers/likeController');
const { protect } = require('../middlewares/authMiddleware');

router.put('/:id/like', protect, likePost);

module.exports = router;