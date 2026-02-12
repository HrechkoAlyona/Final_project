// backend\src\controllers\messageController.js
const Message = require('../models/messageModel');
const User = require('../models/userModel');

// 1. ОТПРАВИТЬ СООБЩЕНИЕ
const sendMessage = async (req, res) => {
    try {
        const { text, recipientId } = req.body;
        const senderId = req.user._id;

        if (!text || !recipientId) {
            return res.status(400).json({ message: "Нет текста или получателя" });
        }

        let message = await Message.create({
            sender: senderId,
            receiver: recipientId,
            text
        });

        await message.populate('sender', 'username avatar');
        await message.populate('receiver', 'username avatar');

        // Socket.io 
        const io = req.app.get('io');
        if (io) {

            // 1. Отправляем получателю (чтобы он увидел сразу)
            io.to(recipientId.toString()).emit('newMessage', message);
            
            // 2. Отправляем себе (чтобы у нас тоже появилось сразу)
            io.to(senderId.toString()).emit('newMessage', message);
        }

        res.status(201).json(message);
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ message: "Ошибка отправки" });
    }
};

// 2. ПОЛУЧИТЬ ПЕРЕПИСКУ (С конкретным юзером)
const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userToChatId },
                { sender: userToChatId, receiver: myId }
            ]
        })
        .sort({ createdAt: 1 })
        .populate('sender', 'username avatar');

        res.json(messages);
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ message: "Ошибка получения переписки" });
    }
};

//  3. ПОЛУЧИТЬ СПИСОК ДИАЛОГОВ (Conversations) 
const getConversations = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const messages = await Message.find({
            $or: [{ sender: currentUserId }, { receiver: currentUserId }]
        })
        .sort({ createdAt: -1 }) // Сначала новые
        .populate('sender', 'username avatar')
        .populate('receiver', 'username avatar');

        const conversationsMap = new Map();

        messages.forEach(msg => {
            if (!msg.sender || !msg.receiver) {
                return; 
            }

            // Кто собеседник?
            const isSender = msg.sender._id.toString() === currentUserId.toString();
            const otherUser = isSender ? msg.receiver : msg.sender;

            // Еще одна проверка на всякий случай
            if (!otherUser || !otherUser._id) {
                return;
            }

            const otherUserId = otherUser._id.toString();

            // Если этого собеседника еще нет в карте, добавляем его
            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    _id: otherUser._id,
                    username: otherUser.username,
                    avatar: otherUser.avatar,
                    lastMessage: msg.text,
                    isSender: isSender
                });
            }
        });

        const conversations = Array.from(conversationsMap.values());
        res.json(conversations);

    } catch (error) {
        console.error("Get Conversations Error:", error);
        res.status(500).json({ message: "Ошибка загрузки диалогов" });
    }
};

// 4. ПОМЕТИТЬ СООБЩЕНИЯ КАК ПРОЧИТАННЫЕ
const markMessagesAsRead = async (req, res) => {
    try {
        const { id: senderId } = req.params; // ID того, кто нам писал
        const myId = req.user._id;           // Наш ID

        // Обновляем все сообщения, где отправитель = senderId, а получатель = мы
        await Message.updateMany(
            { sender: senderId, receiver: myId, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: 'Сообщения помечены прочитанными' });
    } catch (error) {
        console.error("Mark Read Error:", error);
        res.status(500).json({ message: "Ошибка обновления статуса" });
    }
};

module.exports = { 
    sendMessage, 
    getMessages, 
    getConversations, 
    markMessagesAsRead
};
