const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // Создаем токен, который шифрует ID пользователя и живет 30 дней
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = generateToken;

// создание "пропуска" (токена) для пользователя