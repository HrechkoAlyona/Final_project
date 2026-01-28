const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // Тот, кто получает уведомление
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },    // Тот, кто вызвал действие (подписался/лайкнул)
    type: { 
        type: String, 
        enum: ['follow', 'like', 'comment'], 
        required: true 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);