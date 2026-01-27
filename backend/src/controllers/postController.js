const Post = require('../models/postModel');

// Создать новый пост
const createPost = async (req, res) => {
    try {
        const { image, description } = req.body;
        const newPost = await Post.create({
            user: req.user._id, // ID берем из токена (через protect)
            image,
            description
        });
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при создании поста', error: error.message });
    }
};

// Получить все посты
const getPosts = async (req, res) => {
    try {
        // find() найдет все, а populate добавит данные автора (имя и аватар)
        const posts = await Post.find().populate('user', 'username fullName avatar').sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении постов' });
    }
};

module.exports = { createPost, getPosts };