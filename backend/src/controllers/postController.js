// backend/src/controllers/postController.js
const Post = require('../models/postModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

// 1. Создать пост (Усиленная валидация)
const createPost = async (req, res) => {
    try {
        const { description, title } = req.body;

        // Проверка наличия файла
        if (!req.file) {
            return res.status(400).json({ message: 'Пожалуйста, выберите изображение для загрузки' });
        }

        // Проверка MIME-типа (защита от загрузки скриптов)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({ message: 'Неподдерживаемый формат. Используйте JPG, PNG или WEBP' });
        }

        // Проверка размера файла (например, макс 10MB)
        const MAX_SIZE = 10 * 1024 * 1024; // 10MB
        if (req.file.size > MAX_SIZE) {
            return res.status(400).json({ message: 'Файл слишком большой (максимум 10MB)' });
        }

        // Конвертация в Base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const image = `data:${req.file.mimetype};base64,${b64}`;

        const newPost = await Post.create({
            user: req.user._id,
            image,
            title: title ? title.trim() : "",
            description: description ? description.trim() : "",
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
        console.error("Create Post Error:", error); // Логируем ошибку для дебага
        res.status(500).json({ message: 'Ошибка при создании поста' });
    }
};

// 2. Получить посты (С пагинацией)
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, userId } = req.query;
        let query = {};

        if (userId) {
            query = { user: userId };
        } else if (req.path === '/followed') {
            const currentUser = await User.findById(req.user._id);
            const following = currentUser.following || [];
            query = { user: { $in: [...following, req.user._id] } };
        }

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
        console.error("Get Posts Error:", error);
        res.status(500).json({ message: 'Ошибка получения постов' });
    }
};

// 3. EXPLORE (Рандомные посты)
const getExplorePosts = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const currentUser = await User.findById(currentUserId);

        // Исключаем посты тех, на кого мы уже подписаны, и свои собственные
        const excludeIds = [...(currentUser.following || []), currentUserId];

        const posts = await Post.aggregate([
            { $match: { user: { $nin: excludeIds } } },
            { $sample: { size: 10 } }, // Берем 10 случайных
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    'user.password': 0,
                    'user.email': 0,
                    'user.__v': 0
                }
            }
        ]);

        const formattedPosts = posts.map(post => {
            return {
                ...post,
                user: {
                    ...post.user,
                    isFollowed: false, // В Explore мы ни на кого не подписаны по определению
                    followersCount: post.user.followers ? post.user.followers.length : 0
                }
            };
        });

        res.json(formattedPosts);
    } catch (error) {
        console.error("Explore Error:", error);
        res.status(500).json({ message: 'Ошибка получения рекомендаций' });
    }
};

// 4. Получить один пост по ID
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
            return res.status(403).json({ message: 'Нет прав на удаление этого поста' }); // 403 Forbidden лучше, чем 401
        }

        await post.deleteOne();
        res.json({ message: 'Пост успешно удален' });
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

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Нет прав на редактирование' });
        }

        // Обновляем поля, только если они пришли
        if (description !== undefined) post.description = description.trim();
        if (title !== undefined) post.title = title.trim();

        // Если пришла новая картинка - проверяем и обновляем
        if (req.file) {
            // Повторная валидация типа и размера файла
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                return res.status(400).json({ message: 'Неподдерживаемый формат изображения' });
            }
            const MAX_SIZE = 10 * 1024 * 1024;
            if (req.file.size > MAX_SIZE) {
                return res.status(400).json({ message: 'Файл слишком большой' });
            }

            const b64 = Buffer.from(req.file.buffer).toString('base64');
            post.image = `data:${req.file.mimetype};base64,${b64}`;
        }

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
        console.error("Update Post Error:", error);
        res.status(500).json({ message: 'Ошибка обновления поста' });
    }
};

// 8. Лайк 
const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.user._id;

        if (!post) return res.status(404).json({ message: 'Пост не найден' });

        const isLiked = post.likes.some(id => id.toString() === userId.toString());
        let action = 'like';

        if (isLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
            action = 'unlike';
        } else {
            post.likes.push(userId);
            action = 'like';
        }

        await post.save();

        // Отправка уведомления
        if (action === 'like' && post.user.toString() !== userId.toString()) {
            try {
                const notification = await Notification.create({
                    recipient: post.user,
                    sender: userId,
                    type: 'like',
                    post: post._id,
                    isRead: false
                });

                const io = req.app.get('io');
                if (io) {
                    const fullNotif = await Notification.findById(notification._id)
                        .populate('sender', 'username avatar')
                        .populate('post', 'image')
                        .lean();

                    io.to(post.user.toString()).emit('new_notification', fullNotif);
                }
            } catch (notifError) {
                console.error("Notification Error:", notifError);
            }
        }

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


module.exports = {
    createPost,
    getPosts,
    getExplorePosts,
    getMyPosts,
    getPostById,
    deletePost,
    updatePost,
    toggleLike
};