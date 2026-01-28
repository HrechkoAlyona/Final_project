// final_project\backend\src\controllers\postController.js

const Post = require('../models/postModel');
const User = require('../models/userModel');

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
// Получить посты (с фильтрацией)
const getPosts = async (req, res) => {
    try {
        const { type } = req.query; // Получаем тип из URL: ?type=feed
        let query = {};

        // Если запрошена лента подписок (Home)
        if (type === 'feed' && req.user) {
            const currentUser = await User.findById(req.user._id);
            // Показываем посты только тех, на кого подписаны + свои
            query = { user: { $in: [...currentUser.following, req.user._id] } };
        } 
        // Если type=explore или не указан — query остается {}, и find() вернет все посты

        const posts = await Post.find(query)
            .populate('user', 'username fullName avatar')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении постов', error: error.message });
    }
};

// Получить только мои посты (для страницы профиля)
const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении ваших постов' });
    }
};



// Удалить пост
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
        }

        // Проверка: может ли этот пользователь удалить пост? (только автор)
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'У вас нет прав на удаление этого поста' });
        }

        await post.deleteOne();
        res.json({ message: 'Пост успешно удален' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении поста' });
    }
};

// Редактировать описание поста
const updatePost = async (req, res) => {
    try {
        const { description } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
        }

        // Проверка авторства
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'У вас нет прав на редактирование этого поста' });
        }

        post.description = description || post.description;
        const updatedPost = await post.save();
        
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении поста' });
    }
};


module.exports = { createPost, getPosts, getMyPosts, deletePost, updatePost };
