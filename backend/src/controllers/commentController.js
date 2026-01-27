const Comment = require('../models/commentModel');

const addComment = async (req, res) => {
    try {
        const { text, postId } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Текст комментария пуст' });
        }

        const comment = await Comment.create({
            user: req.user._id,
            post: postId,
            text
        });

        // Чтобы сразу вернуть комментарий с именем пользователя:
        const populatedComment = await comment.populate('user', 'username avatar');

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при добавлении комментария' });
    }
};

module.exports = { addComment };