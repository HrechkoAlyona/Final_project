// final_project\backend\src\controllers\likeController.js

const Post = require('../models/postModel');

const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Пост не найден' });

        // 1. Надежная проверка, лайкнул ли пользователь уже пост
        // Превращаем оба ID в строки перед сравнением
        const isLiked = post.likes.some(
            (id) => id.toString() === req.user._id.toString()
        );

        if (isLiked) {
            // 2. Если лайк есть — убираем его (Unlike)
            post.likes = post.likes.filter(
                (id) => id.toString() !== req.user._id.toString()
            );
        } else {
            // 3. Если лайка нет — добавляем (Like)
            post.likes.push(req.user._id);
        }

        await post.save();
        
        // Возвращаем обновленный пост
        res.json(post);
    } catch (error) {
        console.error(error); // Полезно видеть ошибку в консоли сервера
        res.status(500).json({ message: 'Ошибка лайка' });
    }
};

module.exports = { likePost };