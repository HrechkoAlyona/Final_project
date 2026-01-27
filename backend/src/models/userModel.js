const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Пожалуйста, укажите имя пользователя'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Пожалуйста, укажите email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Добавьте валидный email']
    },
    password: {
        type: String,
        required: [true, 'Пожалуйста, укажите пароль'],
        minlength: 6,
        select: false // Это скроет пароль при запросах данных пользователя 
    },

    fullName: { // Добавляем поле из конспекта
        type: String,
        required: [true, 'Полное имя обязательно']
    },
    
    avatar: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' // Стандартная иконка
    },
    bio: {
        type: String,
        maxlength: 150,
        default: ''
    }
}, {
    timestamps: true // Автоматически добавит дату создания и обновления (createdAt, updatedAt)
});

const User = mongoose.model('User', userSchema);

module.exports = User;