// backend\src\controllers\commentController.js

const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const Notification = require('../models/notificationModel');

// 1. ДОБАВИТЬ КОММЕНТАРИЙ
const addComment = async (req, res) => {
    try {
        const { text, postId } = req.body;
        if (!text || !postId) return res.status(400).json({ message: 'Нет текста или ID поста' });

        const comment = await Comment.create({
            user: req.user._id,
            post: postId,
            text,
            likes: []
        });

        const post = await Post.findByIdAndUpdate(postId, {
            $push: { comments: { _id: comment._id, user: req.user._id, text: text, likes: [], createdAt: new Date() } }
        }, { new: true });

        //  УВЕДОМЛЕНИЕ О КОММЕНТАРИИ
        if (post.user.toString() !== req.user._id.toString()) {
            const notification = await Notification.create({
                recipient: post.user,
                sender: req.user._id,
                type: 'comment',
                post: postId,
                message: text,
                isRead: false
            });

            const io = req.app.get('io');
            if (io) {
                const fullNotif = await Notification.findById(notification._id)
                    .populate('sender', 'username avatar')
                    .populate('post', 'image') // Для миниатюры
                    .lean();

                io.to(post.user.toString()).emit('new_notification', fullNotif);
            }
        }

        const populatedComment = await comment.populate('user', 'username avatar');
        res.status(201).json(populatedComment);
    } catch (error) {
        console.error(" Ошибка при добавлении коммента:", error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// 2. УДАЛИТЬ КОММЕНТАРИЙ 
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: 'Комментарий не найден' });

        if (String(comment.user) !== String(userId)) {
            return res.status(403).json({ message: 'Нет прав на удаление' });
        }

        await Comment.findByIdAndDelete(commentId);
        await Post.findByIdAndUpdate(comment.post, {
            $pull: { comments: { _id: commentId } }
        });

        res.status(200).json({ message: 'Комментарий удален' });
    } catch (error) {
        console.error(" Ошибка при удалении комментария:", error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

// 3. ЛАЙКНУТЬ КОММЕНТАРИЙ
const toggleLikeComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user._id;

        if (!commentId || commentId === 'undefined') {
            return res.status(400).json({ message: 'Неверный ID комментария' });
        }

        const post = await Post.findOne({ "comments._id": commentId });
        if (!post) return res.status(404).json({ message: 'Комментарий не найден' });

        const commentInPost = post.comments.find(c => String(c._id) === String(commentId));
        const likesArray = commentInPost.likes || [];
        const isLiked = likesArray.some(id => String(id) === String(userId));

        await Post.updateOne(
            { "comments._id": commentId },
            { [isLiked ? "$pull" : "$addToSet"]: { "comments.$.likes": userId } }
        );

        const standaloneComment = await Comment.findById(commentId);
        if (standaloneComment) {
            if (isLiked) {
                standaloneComment.likes = standaloneComment.likes.filter(uid => String(uid) !== String(userId));
            } else {
                standaloneComment.likes.push(userId);
            }
            await standaloneComment.save();
        }

        //  УВЕДОМЛЕНИЕ О ЛАЙКЕ КОММЕНТАРИЯ
        if (!isLiked && String(commentInPost.user) !== String(userId)) {
            const notification = await Notification.create({
                sender: userId,
                recipient: commentInPost.user,
                type: 'like_comment',
                post: post._id,
                isRead: false
            });

            const io = req.app.get('io');
            if (io) {
                // Добавили populate и lean, чтобы уведомление выглядело правильно сразу
                const fullNotif = await Notification.findById(notification._id)
                    .populate('sender', 'username avatar')
                    .populate('post', 'image')
                    .lean();

                io.to(String(commentInPost.user)).emit('new_notification', fullNotif);
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(" Ошибка при лайке комментария:", error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

module.exports = { addComment, toggleLikeComment, deleteComment };