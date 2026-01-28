//final_project\backend\src\models\postModel.js

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Связываем пост с пользователем
        required: true
    },
    image: {
        type: String, // Тут будет храниться картинка в Base64 (строка)
        required: true
    },
    description: {
        type: String,
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);