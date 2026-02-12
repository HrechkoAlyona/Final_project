// backend\src\controllers\followController.js

const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const Follow = require('../models/followModel');

const toggleFollow = async (req, res) => {
    try {
        const { followingId } = req.body; // ID того, на кого хотим подписаться
        const followerId = req.user._id;  // Наш ID (из middleware protect)

        // 1. Проверка на самоподписку
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
            // --- ЛОГИКА ОТПИСКИ ---
            targetUser.followers.pull(followerId);
            me.following.pull(followingId);
            await Follow.findOneAndDelete({ follower: followerId, following: followingId });

            action = 'unfollow';
        } else {
            // --- ЛОГИКА ПОДПИСКИ ---
            targetUser.followers.push(followerId);
            me.following.push(followingId);
            await Follow.create({ follower: followerId, following: followingId });

            action = 'follow';

            // 2. СОЗДАНИЕ УВЕДОМЛЕНИЯ (только при подписке)
            const notification = await Notification.create({
                recipient: followingId,
                sender: followerId,
                type: 'follow',
                isRead: false
            });

            // 3. ОТПРАВКА ЧЕРЕЗ SOCKET.IO
            const io = req.app.get('io');
            if (io) {
                const fullNotif = await Notification.findById(notification._id)
                    .populate('sender', 'username avatar')
                    .lean();

                //  Событие строго 'new_notification'
                io.to(followingId.toString()).emit('new_notification', fullNotif);
            }
        }

        // 4. СОХРАНЕНИЕ В БАЗУ
        await targetUser.save();
        await me.save();

        res.json({
            message: action === 'follow' ? 'Подписка оформлена' : 'Отписка выполнена',
            isFollowed: action === 'follow'
        });

    } catch (error) {
        console.error(' ToggleFollow Error:', error);
        res.status(500).json({ message: 'Ошибка сервера при обработке подписки' });
    }
};

module.exports = { toggleFollow };