// backend/src/controllers/postController.js

const Post = require('../models/postModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel'); 

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

// 2. Получить посты (Лента и Профиль)
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 4, userId } = req.query;
        let query = {};

        // ПРОВЕРКА 1: Если передан userId, показываем посты только этого автора
        if (userId) {
            query = { user: userId };
        } 
        // ПРОВЕРКА 2: Если мы на роуте /followed, показываем ленту подписок
        else if (req.path === '/followed') {
            const currentUser = await User.findById(req.user._id);
            const following = currentUser.following || [];
            // Посты подписок + свои посты
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
        console.error("GET POSTS ERROR:", error);
        res.status(500).json({ message: 'Ошибка получения постов' });
    }
};

// 3. EXPLORE ( Случайные 10 постов от незнакомцев)
const getExplorePosts = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // 1. Находим текущего пользователя, чтобы получить список его подписок
        const currentUser = await User.findById(currentUserId);
        
        // 2. Формируем массив ID, которые нужно ИСКЛЮЧИТЬ:
        //    (это ID самого пользователя + ID всех, на кого он уже подписан)
        const excludeIds = [...(currentUser.following || []), currentUserId];

        // 3. Используем агрегацию для случайной выборки
        const posts = await Post.aggregate([
            // ШАГ 1: Фильтруем посты (оставляем только от "незнакомцев")
            { 
                $match: { 
                    user: { $nin: excludeIds } 
                } 
            },
            
            // ШАГ 2: Берем 10 случайных постов из оставшихся
            { $sample: { size: 10 } },

            // ШАГ 3: "Подтягиваем" данные автора (populate аналог в aggregate)
            {
                $lookup: {
                    from: 'users', // Имя коллекции пользователей в MongoDB
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            
            // ШАГ 4: $lookup возвращает массив, нам нужен объект -> разворачиваем его
            { $unwind: '$user' },
            
            // ШАГ 5: Убираем лишние/секретные поля автора
            {
                $project: {
                    'user.password': 0,
                    'user.email': 0,
                    'user.__v': 0
                }
            }
        ]);

        // Форматируем данные для фронтенда
        const formattedPosts = posts.map(post => {
            return {
                ...post,
                user: {
                    ...post.user,
                    // Для Explore isFollowed всегда false (мы исключили подписки)
                    isFollowed: false,
                    followersCount: post.user.followers ? post.user.followers.length : 0
                }
            };
        });

        res.json(formattedPosts);
    } catch (error) {
        console.error("EXPLORE ERROR:", error);
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

        // Обработка новой картинки
        if (req.file) {
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
        console.error("UPDATE POST ERROR:", error); 
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

        // 1. Сначала сохраняем лайк в базе!
        await post.save();

        // 2. Только если лайк сохранился и это лайк (не дизлайк) - шлем уведомление
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
                        .lean(); // <--- 🔥 ВАЖНО: Добавили .lean()
                    
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
// 9. ДОБАВИТЬ КОММЕНТАРИЙ 
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

        // --- УВЕДОМЛЕНИЕ ---
        if (post.user.toString() !== req.user._id.toString()) {
            try {
                // 1. Создаем
                const notification = await Notification.create({
                    recipient: post.user,
                    sender: req.user._id,
                    type: 'comment',
                    post: post._id,
                    message: text,
                    isRead: false
                });

                // 2. Готовим объект для отправки (ВАЖНО: добавляем .lean())
                const fullNotif = await Notification.findById(notification._id)
                    .populate('sender', 'username avatar')
                    .populate('post', 'image')
                    .lean(); // <--- 🔥 ЭТО РЕШАЕТ ПРОБЛЕМУ 🔥
                    // .lean() превращает Mongoose Document в обычный JSON, который Redux понимает.

                const io = req.app.get('io');
                if (io) {
                    io.to(post.user.toString()).emit('new_notification', fullNotif);
                }
            } catch (notifError) {
                console.error("Notif Error:", notifError);
            }
        }

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