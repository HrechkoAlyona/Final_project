// frontend\src\components\PostModal\PostHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom'; 
/* 🔥 МЕНЯЕМ ИМПОРТ: используем вертикальные точки */
import { BsThreeDotsVertical } from 'react-icons/bs'; 
import s from './PostModal.module.scss';

const PostHeader = ({ authorData, isEditing, isUpdating, onCancel, onSave, onShowOptions, onClose }) => {
  const avatar = authorData?.avatar || authorData?.profile_image || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const username = authorData?.username || "Unknown User";
  const authorId = authorData?._id;

  return (
    <div className={s.header}>
      {/* 1. Аватарка */}
      <Link to={`/profile/${authorId}`} onClick={onClose}>
        <img src={avatar} alt={username} style={{ cursor: 'pointer' }} />
      </Link>

      {/* 2. Имя пользователя */}
      <Link 
        to={`/profile/${authorId}`} 
        className={s.username} 
        onClick={onClose}
        style={{ textDecoration: 'none', color: '#262626', marginLeft: '12px', marginRight: 'auto' }}
      >
        {username}
      </Link>
      
      {isEditing ? (
         <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
            <button onClick={onSave} disabled={isUpdating} style={{ background: 'none', border: 'none', color: '#0095f6', fontWeight: 600 }}>Done</button>
         </div>
      ) : (
          /* ТОЧКИ */
          <button className={s.moreBtn} onClick={onShowOptions}>
            <BsThreeDotsVertical size={20} /> 
          </button>
      )}
    </div>
  );
};

export default PostHeader;