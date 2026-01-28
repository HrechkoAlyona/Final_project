const express = require('express');
const router = express.Router();
const { toggleFollow } = require('../controllers/followController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, toggleFollow);

module.exports = router;