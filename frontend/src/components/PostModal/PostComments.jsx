// frontend/src/components/PostModal/PostComments.jsx
import React from 'react';
import s from './PostModal.module.scss';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai'; 
import { useToggleCommentLikeMutation } from '../../services/api'; 
import { useAuth } from '../../hooks/useAuth';
import { formatShortTime } from '../../utils/dateUtils'; // Импорт утилиты

const PostComments = ({ post, authorData, isEditing, editContent, setEditContent }) => {
  const { userId } = useAuth(); 
  const [toggleCommentLike] = useToggleCommentLikeMutation();

  const handleLikeClick = async (commentId) => {
    try {
      await toggleCommentLike(commentId).unwrap();
    } catch (error) {
      console.error("Failed to like comment", error);
    }
  };

  return (
    <div className={s.commentsList}>
      
      {/* --- 1. ОПИСАНИЕ ПОСТА (Как первый комментарий) --- */}
      {(post.description || isEditing) && (
        <div className={s.commentItem}>
          <img 
            src={authorData?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
            className={s.commentAvatar} 
            alt="avatar" 
          />
          <div className={s.commentContent}>
            <span className={s.commentUsername}>{authorData?.username}</span>
            
            {isEditing ? (
              <textarea 
                className={s.editInput}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write a caption..." 
                autoFocus
              />
            ) : (
              <>
                <span className={s.commentText}>{post.description}</span>
                {/* Дата создания самого поста */}
                <div className={s.commentMeta}>
                   <span className={s.commentTime}>{formatShortTime(post.createdAt)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- 2. СПИСОК КОММЕНТАРИЕВ --- */}
      {!isEditing && post.comments && post.comments.map((comment, index) => {
        // Проверка лайка
        const isCommentLiked = comment.likes?.some(id => String(id) === String(userId));

        return (
          <div key={comment._id || index} className={s.commentItem}>
            <img 
              src={comment.user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              className={s.commentAvatar} 
              alt="avatar" 
            />
            
            <div className={s.commentContent}>
              {/* Верхняя часть: Имя + Текст */}
              <div>
                <span className={s.commentUsername}>{comment.user?.username || "User"}</span>
                <span className={s.commentText}>{comment.text}</span>
              </div>
              
              {/* Нижняя часть: Время + Лайки */}
              <div className={s.commentMeta}>
                {/* Время */}
                <span className={s.commentTime}>
                  {formatShortTime(comment.createdAt)}
                </span>

                {/* Количество лайков (если > 0) */}
                {comment.likes?.length > 0 && (
                  <span className={s.commentLikesCount}>{comment.likes.length} likes</span>
                )}
                
                {/* Кнопку "Reply" можно добавить сюда же в будущем */}
              </div>
            </div>

            {/* КНОПКА ЛАЙКА (СЕРДЕЧКО) */}
            <button 
              className={s.commentLikeBtn} 
              onClick={() => handleLikeClick(comment._id)}
            >
              {isCommentLiked ? (
                <AiFillHeart color="#ed4956" size={12} />
              ) : (
                <AiOutlineHeart color="#8e8e8e" size={12} />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PostComments;