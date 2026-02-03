const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'], // Сообщение: "Пожалуйста, укажите юзернейм"
        unique: true, // Юзернейм должен быть уникальным
        trim: true // Удаляет пробелы по краям
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'], // Сообщение: "Пожалуйста, укажите email"
        unique: true, // Email должен быть уникальным
        lowercase: true, // Переводит всё в нижний регистр (Test@test.com -> test@test.com)
        // Проверка формата email через регулярное выражение (RegEx)
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'], // Сообщение: "Пожалуйста, укажите пароль"
        minlength: [6, 'Password must be at least 6 characters long'], // Минимум 6 символов
        select: false // Важно: не возвращать пароль при запросе данных пользователя (для безопасности)
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'] // Сообщение: "Полное имя обязательно"
    },
    avatar: {
        type: String,
        // Ссылка на дефолтную картинку-заглушку, если пользователь не загрузил свою
        default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    },
    bio: {
        type: String,
        maxlength: [150, 'Bio cannot be more than 150 characters'], // Ограничение длины описания
        default: ''
    },

    // --- ПОЛЯ ДЛЯ СБРОСА ПАРОЛЯ (Reset Password Fields) ---
    resetPasswordToken: { 
        type: String // Здесь будет храниться временный код для сброса
    },
    resetPasswordExpires: { 
        type: Date // Здесь будет храниться время истечения кода
    }

}, {
    timestamps: true // Автоматически создает поля createdAt (создано) и updatedAt (обновлено)
});

const User = mongoose.model('User', userSchema);

module.exports = User;