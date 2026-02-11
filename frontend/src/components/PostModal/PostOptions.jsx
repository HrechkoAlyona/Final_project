// frontend\src\components\PostModal\PostOptions.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import toast from 'react-hot-toast';
import s from './PostModal.module.scss';

const PostOptions = ({ isMyPost, isDeleting, onDelete, onEdit, onClose, postId }) => {
  const navigate = useNavigate(); //  Хук

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    toast.success("Link copied");
    onClose();
  };

  // 3. Функция перехода
  const handleGoToPost = () => {
    navigate(`/post/${postId}`);
    onClose();
  };

  return (
    <div className={s.optionsOverlay} onClick={onClose}>
      <div className={s.optionsCard} onClick={(e) => e.stopPropagation()}>
        {isMyPost && (
          <>
            <button className={`${s.optionBtn} ${s.dangerBtn}`} onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button className={s.optionBtn} onClick={onEdit}>Edit</button>
          </>
        )}
        {/* 4. Используем handleGoToPost */}
        <button className={s.optionBtn} onClick={handleGoToPost}>Go to post</button>
        <button className={s.optionBtn} onClick={handleCopyLink}>Copy link</button>
        <button className={s.optionBtn} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default PostOptions;