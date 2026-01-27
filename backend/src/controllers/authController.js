const User = require('../models/userModel');
const generateToken = require('../config/jwt'); // Импортируем из нового места
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;

       
        // 1. Проверка, заполнены ли поля
        if (!username || !email || !password || !fullName) {
            return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
        }

        // 2. Проверка, существует ли пользователь
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // 3. Хэширование пароля (шифруем)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Создание пользователя в базе
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            fullName
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                token: generateToken(user._id), // Отправляем токен сразу после регистрации
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера при регистрации', error: error.message });
    }
};




// Login

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Ищем пользователя по email и просим базу вернуть пароль 
        // (так как он у нас select: false)
        const user = await User.findOne({ email }).select('+password');

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Неверный email или пароль' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};


// функция, которая просто отдает данные текущего пользователя

const getUserProfile = async (req, res) => {
    // req.user попадет сюда из "охранника" (protect)
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(404).json({ message: 'Пользователь не найден' });
    }
};






module.exports = { registerUser, loginUser, getUserProfile };

