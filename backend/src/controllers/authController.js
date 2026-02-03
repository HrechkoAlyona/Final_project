const User = require('../models/userModel');
const generateToken = require('../config/jwt');
const bcrypt = require('bcrypt');

// 1. REGISTER
const registerUser = async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;

        if (!username || !email || !password || !fullName) {
            return res.status(400).json({ message: 'Please fill in all fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

// 2. LOGIN
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// 3. PROFILE
const getUserProfile = async (req, res) => {
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// 4. REQUEST RESET (Шаг 1)
const requestPasswordReset = async (req, res) => {
    try {
        const { emailOrUsername } = req.body;

        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetPasswordToken = code;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        console.log("========================================");
        console.log(`RESET CODE FOR ${user.username}: ${code}`);
        console.log("========================================");

        res.json({ message: "Code sent to email", username: user.username });

    } catch (error) {
        console.error("Reset Request Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// 5. CONFIRM RESET (Шаг 2) — С ДИАГНОСТИКОЙ
const resetPasswordStep2 = async (req, res) => {
    try {
        const { username, code, password } = req.body;

        // --- НАЧАЛО БЛОКА ОТЛАДКИ (DEBUG) ---
        console.log("------- ДИАГНОСТИКА СБРОСА ПАРОЛЯ -------");
        console.log("1. Пришло от клиента:", { username, code });

        // Проверяем, что вообще есть в базе у этого пользователя
        const debugUser = await User.findOne({ username });
        
        if (!debugUser) {
            console.log("2. ОШИБКА: Пользователь с таким username вообще не найден в базе!");
        } else {
            console.log("2. Пользователь найден в базе.");
            console.log("   - Код в базе:", debugUser.resetPasswordToken);
            console.log("   - Код от клиента:", code);
            console.log("   - Совпадают ли коды?:", debugUser.resetPasswordToken == code);
            console.log("   - Время истечения (Expires):", debugUser.resetPasswordExpires);
            console.log("   - Текущее время:", new Date());
        }
        console.log("-----------------------------------------");
        // --- КОНЕЦ БЛОКА ОТЛАДКИ ---

        const user = await User.findOne({
            username,
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired code" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        res.json({ message: "Password updated successfully" });

    } catch (error) {
        console.error("Reset Step 2 Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    getUserProfile,
    requestPasswordReset, 
    resetPasswordStep2    
};