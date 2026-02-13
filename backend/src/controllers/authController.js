// backend\src\controllers\authController.js

const User = require('../models/userModel');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

// Вспомогательная функция для генерации токена
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Вспомогательная функция для валидации формата Email
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
};

// 1. РЕГИСТРАЦИЯ
const registerUser = async (req, res) => {
    try {
        let { username, email, password, fullName } = req.body;

        // Валидация наличия полей
        if (!username || !email || !password || !fullName) {
            return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
        }

        // Валидация длины пароля
        if (password.length < 6) {
            return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
        }

        // Валидация формата почты
        if (!validateEmail(email)) {
            return res.status(400).json({ message: 'Введите корректный адрес электронной почты' });
        }

        // Очистка данных (санитайзинг)
        email = email.toLowerCase().trim();
        username = username.trim();

        // Проверка существования (Email или Username)
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(409).json({ message: 'Пользователь с таким email или именем уже существует' });
        }

        // Хеширование пароля
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Создание пользователя
        const user = await User.create({
            username, 
            email, 
            password: hashedPassword, 
            fullName
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("🔴 Registration Error:", error);
        res.status(500).json({ message: 'Ошибка сервера при регистрации' });
    }
};

// 2. ВХОД (LOGIN)
const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').toLowerCase().trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Введите логин и пароль' });
    }

    // Поиск пользователя (включая скрытое поле password)
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    // Сравнение хешей паролей
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || "",
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(" Login Error:", error);
    res.status(500).json({ message: 'Ошибка сервера при авторизации' });
  }
};

// 3. ЗАПРОС СБРОСА ПАРОЛЯ (ШАГ 1)
const requestPasswordReset = async (req, res) => {
    try {
        const { email, username, emailOrUsername } = req.body;
        const search = (email || username || emailOrUsername || '').toLowerCase().trim();

        if (!search) {
             return res.status(400).json({ message: "Введите email или имя пользователя" });
        }

        const user = await User.findOne({
            $or: [{ email: search }, { username: search }]
        });

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        // Генерация кода (6 цифр)
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = code;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 час
        await user.save();

        console.log("\n========================================");
        console.log(`🔑 КОД ДЛЯ СБРОСА (${user.username}): ${code}`);
        console.log("========================================\n");

        res.json({ message: "Код для сброса отправлен" });
    } catch (error) {
        console.error("🔴 Reset Request Error:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

// 4. СМЕНА ПАРОЛЯ (ШАГ 2)
const resetPasswordStep2 = async (req, res) => {
    try {
        const { username, code, password } = req.body; 

        if (!username || !code || !password) {
            return res.status(400).json({ message: "Заполните все поля" });
        }

        const identifier = username.toLowerCase().trim();

        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }], 
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: "Неверный код или срок его действия истек" });
        }

        // Хеширование нового пароля
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        // Очистка полей сброса
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        res.json({ message: "Пароль успешно изменен" });
    } catch (error) {
        console.error("🔴 Reset Step 2 Error:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    requestPasswordReset, 
    resetPasswordStep2    
};