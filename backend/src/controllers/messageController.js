const Message = require('../models/messageModel');

// 1. Отправить сообщение
const sendMessage = async (req, res) => {
    try {
        const { recipientId, text } = req.body;
        const io = req.app.get('io'); 

        const newMessage = await Message.create({
            sender: req.user._id,
            recipient: recipientId,
            text
        });

        // Отправляем через Socket.io получателю
        io.to(recipientId).emit('newMessage', newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка отправки' });
    }
};

// 2. Получить историю переписки (ЭТОГО НЕ ХВАТАЛО)
const getMessages = async (req, res) => {
    try {
        const { userId } = req.params; // ID собеседника
        const myId = req.user._id;     // Мой ID из токена

        // Ищем сообщения между мной и этим пользователем
        const messages = await Message.find({
            $or: [
                { sender: myId, recipient: userId },
                { sender: userId, recipient: myId }
            ]
        }).sort({ createdAt: 1 }); // Сортируем от старых к новым

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка получения сообщений' });
    }
};

// Теперь оба метода экспортируются корректно
module.exports = { sendMessage, getMessages };