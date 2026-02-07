// backend\src\controllers\searchController.js

const User = require('../models/userModel');

const searchUsers = async (req, res) => {
    try {
        const query = req.query.q; // Получаем текст из запроса, например: ?q=Алена
        if (!query) return res.status(400).json({ message: 'Введите текст' });

        // Ищем пользователей, у которых имя или юзернейм совпадает с запросом
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },  // 'i' значит игнорировать регистр
                { fullName: { $regex: query, $options: 'i' } }
            ]
        });

        // Мапим (пересобираем) массив, чтобы поля всегда шли в одном порядке
        const formattedUsers = users.map(user => ({
            _id: user._id,
            username: user.username,
            fullName: user.fullName || "", // Если пусто — будет пустая строка. Отдаем только нужные поля
            avatar: user.avatar,
            bio: user.bio || ""
        }));

        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка', error: error.message });
    }
};

module.exports = { searchUsers };