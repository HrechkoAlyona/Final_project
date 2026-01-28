const User = require('../models/userModel');

// Функция-помощник для строгого порядка полей
const formatUserResponse = (user) => {
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || "",
        bio: user.bio || "",
        avatar: user.avatar || ""
    };
};

// 1. Получить профиль текущего пользователя
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json(formatUserResponse(user));
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
// Если в запросе пришло новое значение, меняем его. Если нет - оставляем старое.
        if (user) {
            user.fullName = req.body.fullName || user.fullName;
            user.bio = req.body.bio || user.bio;
            user.avatar = req.body.avatar || user.avatar;

            const updatedUser = await user.save();
            
            // Возвращаем данные через наш форматировщик
            res.json(formatUserResponse(updatedUser));
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении профиля' });
    }
};

module.exports = { getUserProfile, updateUserProfile };