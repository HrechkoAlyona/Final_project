const express = require('express');
const router = express.Router();
const { addComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, addComment);

module.exports = router;