// backend/src/models/userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false 
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required']
    },
    avatar: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    },
    bio: {
        type: String,
        maxlength: [150, 'Bio cannot be more than 150 characters'],
        default: ''
    },

    // --- ПОЛЯ ДЛЯ СБРОСА ПАРОЛЯ ---
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // --- ПОДПИСКИ ---
    followers: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],
    following: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }],

    //  ИСТОРИЯ ПОИСКА
    search: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

}, {
    timestamps: true 
});

const User = mongoose.model('User', userSchema);

module.exports = User;