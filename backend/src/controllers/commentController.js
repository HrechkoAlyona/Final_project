// backend\src\controllers\commentController.js

const Comment = require('../models/commentModel');
const Post = require('../models/postModel'); // 🔥 Импортируем модель поста

const addComment = async (req, res) => {
    try {
        const { text, postId } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Текст комментария пуст' });
        }

        // 1. Создаем комментарий
        const comment = await Comment.create({
            user: req.user._id,
            post: postId,
            text
        });

        // 2. 🔥 ДОБАВЛЯЕМ комментарий в массив постов
        // Мы находим пост по ID и пушим туда данные
        await Post.findByIdAndUpdate(postId, {
            $push: { 
                comments: { 
                    user: req.user._id, 
                    text: text,
                    createdAt: new Date() 
                } 
            }
        });

        const populatedComment = await comment.populate('user', 'username avatar');
        res.status(201).json(populatedComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при добавлении комментария' });
    }
};

module.exports = { addComment };