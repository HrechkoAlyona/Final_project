// backend/src/controllers/commentController.js

const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const Notification = require('../models/notificationModel'); 

const addComment = async (req, res) => {
    try {
        const { text, postId } = req.body;

        if (!text || !postId) {
            return res.status(400).json({ message: 'Нет текста или ID поста' });
        }

        // 1. Создаем основной документ комментария
        const comment = await Comment.create({
            user: req.user._id,
            post: postId,
            text,
            likes: []
        });

        // 2. Добавляем в пост
        await Post.findByIdAndUpdate(postId, {
            $push: { 
                comments: { 
                    _id: comment._id, 
                    user: req.user._id, 
                    text: text,
                    likes: [],
                    createdAt: new Date() 
                } 
            }
        });

        const populatedComment = await comment.populate('user', 'username avatar');
        res.status(201).json(populatedComment);
    } catch (error) {
        console.error("Ошибка при добавлении коммента:", error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const toggleLikeComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user._id;

        if (!commentId || commentId === 'undefined') {
             return res.status(400).json({ message: 'Неверный ID комментария' });
        }

        // 1. Находим пост
        const post = await Post.findOne({ "comments._id": commentId });
        
        if (!post) {
            return res.status(404).json({ message: 'Комментарий не найден' });
        }

        // 2. БЕЗОПАСНО находим комментарий и проверяем лайк (защита от старых комментов)
        const commentInPost = post.comments.find(c => String(c._id) === String(commentId));
        if (!commentInPost) {
            return res.status(404).json({ message: 'Вложенный комментарий не найден' });
        }

        const likesArray = commentInPost.likes || []; // Если массива нет, берем пустой
        const isLiked = likesArray.some(id => String(id) === String(userId));

        // 3. Обновляем массив в посте
        await Post.updateOne(
            { "comments._id": commentId }, 
            { 
                [isLiked ? "$pull" : "$addToSet"]: { "comments.$.likes": userId } 
            }
        );

        // 4. Обновляем в отдельной коллекции
        const standaloneComment = await Comment.findById(commentId);
        if (standaloneComment) {
            if (isLiked) {
                standaloneComment.likes = standaloneComment.likes.filter(uid => String(uid) !== String(userId));
            } else {
                if (!standaloneComment.likes) standaloneComment.likes = [];
                standaloneComment.likes.push(userId);
            }
            await standaloneComment.save();
        }

        // 5. Отправляем Уведомление
        if (!isLiked && String(commentInPost.user) !== String(userId)) {
            const notification = await Notification.create({
                sender: userId,
                recipient: commentInPost.user,
                type: 'like_comment',
                post: post._id,
            });

            const io = req.app.get('io');
            if (io) {
                await notification.populate('sender', 'username avatar');
                io.to(String(commentInPost.user)).emit('new_notification', notification);
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        // Выводим в консоль БЭКЕНДА точную причину падения
        console.error("🔥 Ошибка сервера при лайке комментария:", error);
        res.status(500).json({ message: 'Ошибка сервера при лайке комментария' });
    }
};

module.exports = { addComment, toggleLikeComment };