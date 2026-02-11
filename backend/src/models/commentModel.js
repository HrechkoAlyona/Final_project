// backend\src\models\commentModel.js

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    text: {
        type: String,
        required: [true, 'Напишите текст комментария'],
        trim: true
    },
    // Массив лайков для комментария
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }]
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);