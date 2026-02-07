// backend/src/models/postModel.js

const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    image: {
        type: String,
        required: [true, 'Пожалуйста, добавьте изображение']
    },
    // --- НОВОЕ ПОЛЕ ---
    title: {
        type: String,
        default: "" // Заголовок не обязателен, может быть пустым
    },
    // ------------------
    description: {
        type: String,
        default: "" 
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema);