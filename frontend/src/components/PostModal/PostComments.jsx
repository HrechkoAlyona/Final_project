// frontend/src/components/PostModal/PostComments.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import s from './PostModal.module.scss';
import { AiOutlineHeart, AiFillHeart, AiOutlineDelete } from 'react-icons/ai'; 
import { useToggleCommentLikeMutation, useDeleteCommentMutation } from '../../services/api'; 
import { useAuth } from '../../hooks/useAuth';
import { formatShortTime } from '../../utils/dateUtils';

const PostComments = ({ post, authorData, isEditing, editContent, setEditContent, onClose }) => {
  const { userId } = useAuth();
  const navigate = useNavigate(); 
  
  const [toggleCommentLike] = useToggleCommentLikeMutation();
  const [deleteComment] = useDeleteCommentMutation(); // Хук для удаления

  // --- 1. ПЕРЕХОД В ПРОФИЛЬ ---
  const handleUserClick = (targetUserId) => {
    if (targetUserId) {
      navigate(`/profile/${targetUserId}`);
      if (onClose) onClose(); // Закрываем модалку, чтобы увидеть профиль
    }
  };

  // --- 2. ЛАЙК КОММЕНТАРИЯ ---
  const handleLikeClick = async (commentId) => {
    try {
      await toggleCommentLike(commentId).unwrap();
    } catch (error) {
      console.error("Failed to like comment", error);
    }
  };

  // --- 3. УДАЛЕНИЕ КОММЕНТАРИЯ ---
  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteComment(commentId).unwrap();
        toast.success("Comment deleted");
      } catch (error) {
        console.error("Failed to delete", error);
        toast.error("Failed to delete comment");
      }
    }
  };

  return (
    <div className={s.commentsList}>
      
      {/* 1. ОПИСАНИЕ ПОСТА (Автор поста) */}
      {(post.description || isEditing) && (
        <div className={s.commentItem}>
          <img 
            src={authorData?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
            className={s.commentAvatar} 
            alt="avatar"
            style={{ cursor: 'pointer' }}
            onClick={() => handleUserClick(authorData?._id)} 
          />
          <div className={s.commentContent}>
            <span 
              className={s.commentUsername} 
              style={{ cursor: 'pointer' }}
              onClick={() => handleUserClick(authorData?._id)}
            >
              {authorData?.username}
            </span>
            
            {isEditing ? (
              <textarea 
                className={s.editInput}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write a caption..." 
                autoFocus
                rows={20}
              />
            ) : (
              <>
                <span className={s.commentText}>{post.description}</span>
                <div className={s.commentMeta}>
                   <span className={s.commentTime}>{formatShortTime(post.createdAt)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. СПИСОК КОММЕНТАРИЕВ */}
      {!isEditing && post.comments && post.comments.map((comment, index) => {
        const isCommentLiked = comment.likes?.some(id => String(id) === String(userId));
        
        // Получаем ID автора комментария (учитываем, что user может быть объектом или строкой)
        const commentAuthorId = comment.user?._id || comment.user;
        const commentUsername = comment.user?.username || "User";
        const commentAvatar = comment.user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

        // Проверяем, мой ли это комментарий
        const isMyComment = String(commentAuthorId) === String(userId);

        return (
          <div key={comment._id || index} className={s.commentItem}>
            <img 
              src={commentAvatar} 
              className={s.commentAvatar} 
              alt="avatar"
              style={{ cursor: 'pointer' }}
              onClick={() => handleUserClick(commentAuthorId)} 
            />
            
            <div className={s.commentContent}>
              <div>
                <span 
                  className={s.commentUsername}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleUserClick(commentAuthorId)}
                >
                  {commentUsername}
                </span>
                <span className={s.commentText}>{comment.text}</span>
              </div>
              
              <div className={s.commentMeta}>
                <span className={s.commentTime}>
                  {formatShortTime(comment.createdAt)}
                </span>
                
                {comment.likes?.length > 0 && (
                  <span className={s.commentLikesCount}>{comment.likes.length} likes</span>
                )}

                {/* КНОПКА УДАЛЕНИЯ (Только для автора) */}
                {isMyComment && (
                  <button 
                    className={s.deleteCommentBtn} 
                    onClick={() => handleDeleteComment(comment._id)}
                    title="Delete comment"
                  >
                    <AiOutlineDelete size={14} />
                  </button>
                )}
              </div>
            </div>

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
