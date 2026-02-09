// backend/src/controllers/followController.js
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const Follow = require('../models/followModel'); // Импортируем модель связей

const toggleFollow = async (req, res) => {
    try {
        const { followingId } = req.body; // На кого подписываемся
        const followerId = req.user._id;  // Кто подписывается (мы)

        if (followerId.toString() === followingId) {
            return res.status(400).json({ message: 'Нельзя подписаться на самого себя' });
        }

        const targetUser = await User.findById(followingId);
        const me = await User.findById(followerId);

        if (!targetUser || !me) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        let action;
        const isAlreadyFollowing = targetUser.followers.some(id => id.toString() === followerId.toString());

        if (isAlreadyFollowing) {
            // --- ОТПИСКА ---
            // 1. Убираем нас из подписчиков цели
            targetUser.followers.pull(followerId);
            // 2. Убираем цель из наших подписок (ВАЖНО для фронтенда!)
            me.following.pull(followingId);
            // 3. Удаляем запись из таблицы связей
            await Follow.findOneAndDelete({ follower: followerId, following: followingId });
            
            action = 'unfollow';
        } else {
            // --- ПОДПИСКА ---
            // 1. Добавляем нас в подписчики цели
            targetUser.followers.push(followerId);
            // 2. Добавляем цель в наши подписки
            me.following.push(followingId);
            // 3. Создаем запись в таблице связей
            await Follow.create({ follower: followerId, following: followingId });

            action = 'follow';

            // Создаем уведомление
            await Notification.create({
                recipient: followingId,
                sender: followerId,
                type: 'follow'
            });
        }

        // Сохраняем изменения у обоих
        await targetUser.save();
        await me.save();

        // Socket.io уведомление
        const io = req.app.get('io');
        if (io) {
            io.to(followingId).emit('newNotification', { 
                message: action === 'follow' ? 'На вас подписались!' : 'Отписка',
                from: me.username
            });
        }

        res.json({ 
            message: action === 'follow' ? 'Подписка оформлена' : 'Отписка выполнена',
            isFollowed: action === 'follow'
        });
    } catch (error) {
        console.error('ToggleFollow Error:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

module.exports = { toggleFollow };