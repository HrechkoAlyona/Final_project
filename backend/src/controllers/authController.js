// backend\src\controllers\authController.js

const User = require('../models/userModel');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken');

// Генерация токена
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// 1. РЕГИСТРАЦИЯ
const registerUser = async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;
        if (!username || !email || !password || !fullName) {
            return res.status(400).json({ message: 'Заполните все поля' });
        }
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Пользователь уже существует' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username, email, password: hashedPassword, fullName
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка регистрации' });
    }
};

// 2. ВХОД (LOGIN)
const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username; // Берем что дали

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Заполните логин и пароль' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
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
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// 3. ПРОФИЛЬ
const getUserProfile = async (req, res) => {
    if (req.user) res.json(req.user);
    else res.status(404).json({ message: 'Пользователь не найден' });
};

// 4. СБРОС ПАРОЛЯ 
const requestPasswordReset = async (req, res) => {
    try {
        console.log("Запрос на сброс пароля:", req.body);
        
        // Фронтенд может прислать 'email', 'username' или 'emailOrUsername'
        // Мы проверяем ВСЁ
        const { email, username, emailOrUsername } = req.body;
        const search = email || username || emailOrUsername;

        if (!search) {
             return res.status(400).json({ message: "Введите email или имя пользователя" });
        }

        const user = await User.findOne({
            $or: [{ email: search }, { username: search }]
        });

        if (!user) {
            console.log("Юзер не найден:", search);
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        // Генерируем код
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = code;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        // ВЫВОД В ТЕРМИНАЛ
        console.log("\n========================================");
        console.log(`🔑 КОД ДЛЯ ${user.username}: ${code}`);
        console.log("========================================\n");

        res.json({ message: "Код отправлен (см. консоль сервера)" });

    } catch (error) {
        console.error("Reset Error:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};
// 5. СМЕНА ПАРОЛЯ (ИСПРАВЛЕННАЯ ВЕРСИЯ)
const resetPasswordStep2 = async (req, res) => {
    try {
        console.log("\n--- НАЧАЛО ШАГА 2 (СМЕНА ПАРОЛЯ) ---");
        // frontend шлет поле 'username', но там может быть и email
        const { username, code, password } = req.body; 

        console.log("📥 Полученные данные:", { username, code, password });

        // 1. Проверка
        if (!username || !code || !password) {
            return res.status(400).json({ message: "Заполните все поля" });
        }

        // 2. Поиск пользователя 
        // Мы ищем пользователя, у которого (Username = введенному ИЛИ Email = введенному)
        // И при этом совпадает код, и код не истек.
        const user = await User.findOne({
            $or: [{ email: username }, { username: username }], 
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) {
            console.log("❌ ОШИБКА: Пользователь не найден или код неверный.");
            return res.status(400).json({ message: "Неверный код или он истек" });
        }

        console.log(`✅ Пользователь найден: ${user.username}. Меняем пароль...`);

        // 3. Хешируем и сохраняем
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        console.log("🎉 ПАРОЛЬ УСПЕШНО ИЗМЕНЕН!");
        console.log("------------------------------------\n");

        res.json({ message: "Пароль успешно изменен" });

    } catch (error) {
        console.error("🔥 Step 2 Error:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

module.exports = { 
    registerUser, loginUser, getUserProfile, 
    requestPasswordReset, resetPasswordStep2    
};