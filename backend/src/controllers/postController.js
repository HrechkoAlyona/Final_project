// backend/src/controllers/postController.js

const Post = require('../models/postModel');
const User = require('../models/userModel');

// 1. Создать новый пост
const createPost = async (req, res) => {
    try {
        const { description, title } = req.body; 
        
        if (!req.file) {
            return res.status(400).json({ message: 'Пожалуйста, добавьте изображение' });
        }

        // Конвертация изображения
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const image = `data:${req.file.mimetype};base64,${b64}`;

        const newPost = await Post.create({
            user: req.user._id,
            image: image,
            title: title || "",       
            description: description  
        });

        await newPost.populate('user', 'username avatar');

        res.status(201).json(newPost);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: 'Ошибка при создании поста', error: error.message });
    }
};

// 2. Получить все посты (Лента или Explore)
const getPosts = async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};

        if (type === 'feed' && req.user) {
            const currentUser = await User.findById(req.user._id);
            query = { user: { $in: [...currentUser.following, req.user._id] } };
        } 

        const posts = await Post.find(query)
            .populate('user', 'username fullName avatar')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error("Ошибка при получении постов:", error);
        res.status(500).json({ message: 'Ошибка при получении постов', error: error.message });
    }
};

// 3. Получить посты текущего пользователя
const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user._id })
            .populate('user', 'username fullName avatar')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении ваших постов' });
    }
};

// 4. 🔥 НОВОЕ: Получить ОДИН пост по ID (для модального окна)
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'username avatar') // Данные автора поста
            .populate({
                path: 'comments', // Данные комментариев
                populate: { path: 'user', select: 'username avatar' } // Данные авторов комментариев
            });

        if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
        }
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения поста' });
    }
};

// 5. Удалить пост
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'У вас нет прав на удаление этого поста' });
        }

        await post.deleteOne();
        res.json({ message: 'Пост успешно удален' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении поста' });
    }
};

// 6. Обновить пост (Заголовок и Описание)
const updatePost = async (req, res) => {
    try {
        const { description, title } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Пост не найден' });
        
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Нет прав на редактирование' });
        }

        if (description !== undefined) post.description = description;
        if (title !== undefined) post.title = title;

        const updatedPost = await post.save();
        await updatedPost.populate('user', 'username avatar');

        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении поста' });
    }
};

module.exports = { 
    createPost, 
    getPosts, 
    getMyPosts, 
    getPostById,
    deletePost, 
    updatePost 
};