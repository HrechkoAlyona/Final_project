const Post = require('../models/postModel');

const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Пост не найден' });

        const isLiked = post.likes.includes(req.user._id);
        if (isLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
        } else {
            post.likes.push(req.user._id);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка лайка' });
    }
};

module.exports = { likePost };