const Follow = require('../models/followModel');
const Notification = require('../models/notificationModel');

const toggleFollow = async (req, res) => {
    try {
        const { followingId } = req.body; // ID того, на кого хотим подписаться
        const followerId = req.user._id; // Твой ID (берется из токена)

        // Защита: нельзя подписаться на самого себя
        if (followerId.toString() === followingId) {
            return res.status(400).json({ message: 'Нельзя подписаться на самого себя' });
        }
 
        // Ищем, есть ли уже такая подписка в базе
        const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });

        if (existingFollow) {
            await Follow.findByIdAndDelete(existingFollow._id);
            res.json({ message: 'Отписка выполнена' });
        } else {
            await Follow.create({ follower: followerId, following: followingId });
            
            // СОЗДАЕМ УВЕДОМЛЕНИЕ
            await Notification.create({
                recipient: followingId, // Кому придет (тому, на кого подписались)
                sender: followerId,    // От кого (кто нажал кнопку)
                type: 'follow'
            });
            const io = req.app.get('io');
            io.to(followingId).emit('newNotification', { message: 'На вас подписались!' });

            res.status(201).json({ message: 'Подписка оформлена' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

module.exports = { toggleFollow };