const User = require('../models/userModel');
const Post = require('../models/postModel');
const Notification = require('../models/notificationModel');

// Вспомогательная функция для формирования чистого ответа
const formatUserResponse = (user) => {
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        website: user.website || "",
        followers: user.followers || [],
        following: user.following || [],
        followersCount: user.followers ? user.followers.length : 0,
        followingCount: user.following ? user.following.length : 0
    };
};

// 1. Получить профиль текущего пользователя (Me)
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('search', 'username fullName avatar');

        if (user) {
            const response = {
                ...formatUserResponse(user),
                search: user.search || []
            };
            res.json(response);
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// 2. Обновить профиль пользователя
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            if (req.body.username) user.username = req.body.username;
            if (req.body.website !== undefined) user.website = req.body.website;
            if (req.body.bio !== undefined) user.bio = req.body.bio;
            if (req.body.fullName) user.fullName = req.body.fullName;
            if (req.body.avatar) user.avatar = req.body.avatar;

            const updatedUser = await user.save();
            res.json(formatUserResponse(updatedUser));
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Это имя пользователя уже занято' });
        }
        res.status(500).json({ message: 'Ошибка при обновлении профиля' });
    }
};

// 3. Получить профиль ЛЮБОГО пользователя по ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate('user', 'username avatar');

        const userProfile = {
            ...formatUserResponse(user),
            posts: posts,
            postsCount: posts.length,
            // Проверка подписки для отображения кнопки в профиле
            isFollowing: req.user ? user.followers.includes(req.user._id) : false
        };

        res.json(userProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении профиля' });
    }
};

// 4. Подписаться / Отписаться (С УВЕДОМЛЕНИЕМ)
const followUser = async (req, res) => {
    try {
        const targetUserId = req.body.followingId || req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ message: 'Вы не можете подписаться на самого себя' });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const isFollowing = targetUser.followers.includes(currentUserId);

        if (isFollowing) {
            // ОТПИСКА
            await targetUser.updateOne({ $pull: { followers: currentUserId } });
            await currentUser.updateOne({ $pull: { following: targetUserId } });
            res.json({ message: 'User unfollowed', isFollowing: false });
        } else {
            // ПОДПИСКА
            await targetUser.updateOne({ $push: { followers: currentUserId } });
            await currentUser.updateOne({ $push: { following: targetUserId } });

            //  СОЗДАЕМ УВЕДОМЛЕНИЕ 
            try {
                // Проверка на дубликат (чтобы не спамить при переподписке)
                const existingNotif = await Notification.findOne({
                    recipient: targetUserId,
                    sender: currentUserId,
                    type: 'follow'
                });

                if (!existingNotif) {
                    const notification = await Notification.create({
                        recipient: targetUserId,
                        sender: currentUserId,
                        type: 'follow', 
                        message: 'started following you.',
                        isRead: false
                    });

                    // Готовим для сокета (добавлен .lean())
                    const fullNotif = await Notification.findById(notification._id)
                        .populate('sender', 'username avatar')
                        .lean();

                    const io = req.app.get('io');
                    if (io) {
                        io.to(targetUserId.toString()).emit('new_notification', fullNotif);
                    }
                }
            } catch (notifError) {
                console.error("Follow Notification Error:", notifError);
            }

            res.json({ message: 'User followed', isFollowing: true });
        }
    } catch (error) {
        console.error("Follow Error:", error);
        res.status(500).json({ message: 'Ошибка при подписке' });
    }
};

// ИСТОРИЯ ПОИСКА 
const addToSearchHistory = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUser = await User.findById(req.user._id);
        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        currentUser.search = currentUser.search.filter(id => id.toString() !== targetUserId);
        currentUser.search.unshift(targetUserId);
        if (currentUser.search.length > 10) currentUser.search.pop();

        await currentUser.save();
        res.json({ message: 'Added to history' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const removeFromSearchHistory = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUser = await User.findById(req.user._id);
        currentUser.search = currentUser.search.filter(id => id.toString() !== targetUserId);
        await currentUser.save();
        res.json({ message: 'Removed from history' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const clearSearchHistory = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        currentUser.search = [];
        await currentUser.save();
        res.json({ message: 'History cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// СПИСКИ ДЛЯ МОДАЛЬНОГО ОКНА

const getUserFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('followers', 'username fullName avatar followers');

        if (!user) return res.status(404).json({ message: 'User not found' });

        const currentUserId = req.user._id.toString();

        const followersWithStatus = user.followers.map(follower => {
            const followerObj = follower.toObject();
            return {
                ...followerObj,
                isFollowing: followerObj.followers ? followerObj.followers.some(id => id.toString() === currentUserId) : false
            };
        });

        res.json(followersWithStatus);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getUserFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('following', 'username fullName avatar followers');

        if (!user) return res.status(404).json({ message: 'User not found' });

        const currentUserId = req.user._id.toString();

        const followingWithStatus = user.following.map(followingUser => {
            const followingObj = followingUser.toObject();
            return {
                ...followingObj,
                isFollowing: followingObj.followers ? followingObj.followers.some(id => id.toString() === currentUserId) : false
            };
        });

        res.json(followingWithStatus);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getUserById,
    followUser,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
    getUserFollowers,
    getUserFollowing
};