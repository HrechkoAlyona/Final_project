// backend\src\models\notificationModel.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'follow', 'like_comment'],
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    message: { // Опционально, если захотим хранить текст
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);