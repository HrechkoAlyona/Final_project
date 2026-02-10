// backend\src\middlewares\authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Получаем токен из заголовка
      token = req.headers.authorization.split(' ')[1];

      // Декодируем
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Получаем юзера (без пароля)
      req.user = await User.findById(decoded.id).select('-password');

      return next(); // return, чтобы выйти из функции
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };