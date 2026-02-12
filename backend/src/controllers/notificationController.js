// backend\src\controllers\notificationController.js
const Notification = require('../models/notificationModel');

// Получить все уведомления для текущего пользователя
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'username avatar') // Кто подписался/лайкнул
            .populate('post', 'image') // чтобы видеть миниатюру поста
            .sort({ createdAt: -1 }); // Сначала новые

        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении уведомлений' });
    }
};

// Отметить уведомления как прочитанные

const markNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'Уведомления прочитаны' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при обновлении уведомлений' });
    }
};

module.exports = { getNotifications, markNotificationsAsRead };