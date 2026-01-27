// проверка токена в заголовках запроса. 
// Если токен правильный, то пропускает к данным, если нет, то говорит «Доступ запрещен»

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token;

    // Проверяем, есть ли токен в заголовках (Authorization: Bearer ТОКЕН)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Отрезаем слово "Bearer " и берем сам токен
            token = req.headers.authorization.split(' ')[1];

            // Декодируем токен
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Находим пользователя в базе по ID из токена и добавляем его в объект запроса (req.user)
            req.user = await User.findById(decoded.id).select('-password');

            next(); // Пропускаем дальше к контроллеру
        } catch (error) {
            res.status(401).json({ message: 'Не авторизован, токен не подходит' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Не авторизован, токена нет' });
    }
};

module.exports = { protect };