// backend/src/controllers/postController.js
const Post = require('../models/postModel');
const User = require('../models/userModel');

// 1. Создать пост 
const createPost = async (req, res) => {
    try {
        const { description, title } = req.body; 
        if (!req.file) return res.status(400).json({ message: 'Добавьте изображение' });

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const image = `data:${req.file.mimetype};base64,${b64}`;

        const newPost = await Post.create({
            user: req.user._id,
            image,
            title: title || "", 
            description: description || "",
            comments: [], // Инициализируем пустой массив
            likes: []
        });

        await newPost.populate('user', 'username avatar followers following');
        
        const user = newPost.user.toObject();
        res.status(201).json({
            ...newPost.toObject(),
            user: {
                ...user,
                isFollowed: user.followers.some(id => id.toString() === req.user._id.toString()),
                followersCount: user.followers.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка создания поста' });
    }
};

// 2. Получить посты
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 4 } = req.query;
        let query = {};

        if (req.path === '/followed') {
            const currentUser = await User.findById(req.user._id);
            const following = currentUser.following || [];
            query = { user: { $in: [...following, req.user._id] } };
        }

        let posts = await Post.find(query)
            .populate('user', 'username fullName avatar followers following')
            .populate('comments.user', 'username avatar') // Подгружаем авторов комментариев
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((page - 1) * limit);

        const userId = req.user._id.toString();

        posts = posts.map(post => {
            const user = post.user.toObject();
            return {
                ...post.toObject(),
                user: { 
                    ...user, 
                    isFollowed: user.followers.some(id => id.toString() === userId),
                    followersCount: user.followers.length 
                }
            };
        });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка получения постов' });
    }
};

// 3. EXPLORE
const getExplorePosts = async (req, res) => {
    try {
        let posts = await Post.find({ user: { $ne: req.user._id } })
            .populate('user', 'username avatar followers following')
            .populate('comments.user', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(21);

        const userId = req.user._id.toString();

        posts = posts.map(post => {
            const user = post.user.toObject();
            return {
                ...post.toObject(),
                user: { 
                    ...user, 
                    isFollowed: user.followers.some(id => id.toString() === userId),
                    followersCount: user.followers.length 
                }
            };
        });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка получения рекомендаций' });
    }
};

// 4. Получить один пост
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'username avatar followers following')
            .populate('comments.user', 'username avatar');

        if (!post) return res.status(404).json({ message: 'Пост не найден' });

        const user = post.user.toObject();
        res.json({
            ...post.toObject(),
            user: {
                ...user,
                isFollowed: user.followers.some(id => id.toString() === req.user._id.toString()),
                followersCount: user.followers.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// 5. Мои посты
const getMyPosts = async (req, res) => {
    try {
        let posts = await Post.find({ user: req.user._id })
            .populate('user', 'username fullName avatar followers following')
            .populate('comments.user', 'username avatar')
            .sort({ createdAt: -1 });

        const userId = req.user._id.toString();

        posts = posts.map(post => {
            const user = post.user.toObject();
            return {
                ...post.toObject(),
                user: {
                    ...user,
                    isFollowed: user.followers.some(id => id.toString() === userId),
                    followersCount: user.followers.length
                }
            };
        });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка получения ваших постов' });
    }
};

// 6. Удалить пост
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Пост не найден' });
        
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Нет прав' });
        }
        
        await post.deleteOne();
        res.json({ message: 'Удалено' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка удаления' });
    }
};

// 7. Обновить пост
const updatePost = async (req, res) => {
    try {
        const { description, title } = req.body;
        const post = await Post.findById(req.params.id);
        
        if (!post) return res.status(404).json({ message: 'Пост не найден' });
        if (post.user.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Нет прав' });

        if (description !== undefined) post.description = description;
        if (title !== undefined) post.title = title;

        const updatedPost = await post.save();
        await updatedPost.populate('user', 'username avatar followers following');

        const user = updatedPost.user.toObject();
        res.json({
            ...updatedPost.toObject(),
            user: {
                ...user,
                isFollowed: user.followers.some(id => id.toString() === req.user._id.toString()),
                followersCount: user.followers.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка обновления' });
    }
};

// 8. Лайк
const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.user._id;

        if (!post) return res.status(404).json({ message: 'Пост не найден' });

        const isLiked = post.likes.includes(userId);
        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            post.likes.push(userId);
        }

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('user', 'username avatar followers following')
            .populate('comments.user', 'username avatar');

        const user = updatedPost.user.toObject();
        
        res.json({
            ...updatedPost.toObject(),
            user: {
                ...user,
                isFollowed: user.followers.some(id => id.toString() === userId.toString()),
                followersCount: user.followers.length
            }
        });
    } catch (error) {
        console.error('ToggleLike Error:', error);
        res.status(500).json({ message: 'Ошибка при обработке лайка' });
    }
};

//  9. ДОБАВИТЬ КОММЕНТАРИЙ (НОВАЯ ФУНКЦИЯ) 
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Комментарий не может быть пустым' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Пост не найден' });

        const newComment = {
            user: req.user._id,
            text,
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        // Возвращаем обновленный список комментариев с аватарками
        const updatedPost = await Post.findById(req.params.id)
            .populate('comments.user', 'username avatar');

        res.status(201).json(updatedPost.comments);
    } catch (error) {
        console.error('AddComment Error:', error);
        res.status(500).json({ message: 'Ошибка добавления комментария' });
    }
};

module.exports = { 
    createPost, 
    getPosts, 
    getExplorePosts,
    getMyPosts, 
    getPostById, 
    deletePost, 
    updatePost,
    toggleLike,
    addComment 
};