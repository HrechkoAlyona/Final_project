import React from 'react';
import { AiOutlineHeart } from 'react-icons/ai'; // Лайк коммента
import s from './PostDetailsModal.module.scss';

const CommentItem = ({ comment }) => {
  // Заглушки, пока нет реальных данных
  const username = comment?.author?.username || "user";
  const avatar = comment?.author?.profile_image || "https://via.placeholder.com/150";
  const text = comment?.content || "";
  const timeAgo = "2h"; // Потом подключим библиотеку дат

  return (
    <div className={s.commentRow}>
      <img src={avatar} alt={username} className={s.avatar} />
      
      <div className={s.commentContent}>
        <div>
          <span className={s.username}>{username}</span>
          <span>{text}</span>
        </div>
        <div className={s.meta}>
          <span>{timeAgo}</span>
          <span>{comment?.like_count || 0} likes</span>
          <span>Reply</span>
        </div>
      </div>

      <div className={s.likeHeart}>
        <AiOutlineHeart />
      </div>
    </div>
  );
};

export default CommentItem;