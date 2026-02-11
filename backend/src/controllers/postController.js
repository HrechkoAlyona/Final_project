// backend/src/controllers/postController.js
const Post = require('../models/postModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel'); // 🔥 Импортировали

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
            comments: [], 
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
        // Достаем userId из параметров строки запроса (?userId=...)
        const { page = 1, limit = 4, userId } = req.query;
        let query = {};

        //  ПРОВЕРКА 1: Если передан userId, показываем посты только этого автора
        if (userId) {
            query = { user: userId };
        } 
        //  ПРОВЕРКА 2: Если мы на роуте /followed, показываем ленту подписок
        else if (req.path === '/followed') {
            const currentUser = await User.findById(req.user._id);
            const following = currentUser.following || [];
            // Посты подписок + свои посты
            query = { user: { $in: [...following, req.user._id] } };
        }

        // Если userId нет и путь не /followed, query останется {}, и загрузятся все посты (для общей ленты)

        let posts = await Post.find(query)
            .populate('user', 'username fullName avatar followers following')
            .populate('comments.user', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((page - 1) * limit);

        const currentUserId = req.user._id.toString();

        posts = posts.map(post => {
            const user = post.user.toObject();
            return {
                ...post.toObject(),
                user: { 
                    ...user, 
                    isFollowed: user.followers.some(id => id.toString() === currentUserId),
                    followersCount: user.followers.length 
                }
            };
        });

        res.json(posts);
    } catch (error) {
        console.error("GET POSTS ERROR:", error);
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
        
        // Проверка прав
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Нет прав' });
        }

        // Обновляем текстовые поля
        if (description !== undefined) post.description = description;
        if (title !== undefined) post.title = title;

        // 🔥 НОВОЕ: Обработка новой картинки, если она была загружена
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            post.image = `data:${req.file.mimetype};base64,${b64}`;
        }

        const updatedPost = await post.save();
        
        // Возвращаем обновленный пост с данными пользователя
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
        console.error("UPDATE POST ERROR:", error); 
        res.status(500).json({ message: 'Ошибка обновления поста' });
    }
};

// 8. Лайк (С УВЕДОМЛЕНИЕМ)
const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.user._id;

        if (!post) return res.status(404).json({ message: 'Пост не найден' });

        // Проверяем, есть ли лайк (приводим к строке для надежности)
        const isLiked = post.likes.some(id => id.toString() === userId.toString());

        if (isLiked) {
            // Убираем лайк
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            // Ставим лайк
            post.likes.push(userId);

            // 🔥 СОЗДАЕМ УВЕДОМЛЕНИЕ (если лайкаем не свой пост)
            if (post.user.toString() !== userId.toString()) {
                const notification = await Notification.create({
                    recipient: post.user,
                    sender: userId,
                    type: 'like',
                    post: post._id,
                    isRead: false
                });

                // Socket.io
                const io = req.app.get('io');
                const fullNotif = await Notification.findById(notification._id)
                    .populate('sender', 'username avatar')
                    .populate('post', 'image');
                
                io.to(post.user.toString()).emit('new_notification', fullNotif);
            }
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

// 9. ДОБАВИТЬ КОММЕНТАРИЙ (С УВЕДОМЛЕНИЕМ)
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

        //  СОЗДАЕМ УВЕДОМЛЕНИЕ (если комментируем не свой пост)
        if (post.user.toString() !== req.user._id.toString()) {
            const notification = await Notification.create({
                recipient: post.user,
                sender: req.user._id,
                type: 'comment',
                post: post._id,
                isRead: false
            });

            // Socket.io
            const io = req.app.get('io');
            const fullNotif = await Notification.findById(notification._id)
                .populate('sender', 'username avatar')
                .populate('post', 'image');
            
            io.to(post.user.toString()).emit('new_notification', fullNotif);
        }

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