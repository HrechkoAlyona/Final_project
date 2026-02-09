// backend/src/controllers/userController.js

const User = require('../models/userModel');
const Post = require('../models/postModel'); 

// Вспомогательная функция для формирования красивого ответа
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

// 1. Получить профиль текущего пользователя
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
            // Обновляем поля, если они пришли в запросе
            
            // USERNAME
            if (req.body.username) {
                user.username = req.body.username;
            }

            // WEBSITE (проверка на undefined позволяет передать пустую строку и стереть сайт)
            if (req.body.website !== undefined) {
                user.website = req.body.website;
            }

            // BIO
            if (req.body.bio !== undefined) {
                user.bio = req.body.bio;
            }

            // FULL NAME
            if (req.body.fullName) {
                user.fullName = req.body.fullName;
            }

            // AVATAR
            if (req.body.avatar) {
                user.avatar = req.body.avatar;
            }

            const updatedUser = await user.save();
            res.json(formatUserResponse(updatedUser));
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        // Если такой username уже занят
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
            followersCount: user.followers ? user.followers.length : 0,
            followingCount: user.following ? user.following.length : 0,
            isFollowing: req.user ? user.followers.includes(req.user._id) : false
        };

        res.json(userProfile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении профиля' });
    }
};

// 4. Подписаться / Отписаться (Toggle Follow)
const followUser = async (req, res) => {
    try {
        const targetUserId = req.params.id; 
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
            await targetUser.updateOne({ $pull: { followers: currentUserId } });
            await currentUser.updateOne({ $pull: { following: targetUserId } });
            res.json({ message: 'User unfollowed', isFollowing: false });
        } else {
            await targetUser.updateOne({ $push: { followers: currentUserId } });
            await currentUser.updateOne({ $push: { following: targetUserId } });
            res.json({ message: 'User followed', isFollowing: true });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при подписке' });
    }
};

// 5. Добавить в историю поиска
const addToSearchHistory = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const currentUser = await User.findById(req.user._id);

        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        // Удаляем дубликаты
        currentUser.search = currentUser.search.filter(id => id.toString() !== targetUserId);
        
        // Добавляем в начало
        currentUser.search.unshift(targetUserId);

        // Храним только последние 10
        if (currentUser.search.length > 10) {
            currentUser.search.pop();
        }

        await currentUser.save();
        res.json({ message: 'Added to history' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 6. Удалить одного из истории
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

// 7. Очистить всю историю
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

module.exports = { 
    getUserProfile, 
    updateUserProfile, 
    getUserById,
    followUser,
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory
};