// backend\src\models\conversationModel.js

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
}, { timestamps: true }); // Автоматически добавит createdAt и updatedAt

module.exports = mongoose.model('Conversation', conversationSchema);