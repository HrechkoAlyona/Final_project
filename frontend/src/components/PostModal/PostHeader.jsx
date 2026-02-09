// frontend\src\components\PostModal\PostHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // 🔥 Импорт Link
import { AiOutlineMore } from 'react-icons/ai';
import s from './PostModal.module.scss';

// 🔥 Принимаем onClose в пропсах
const PostHeader = ({ authorData, isEditing, isUpdating, onCancel, onSave, onShowOptions, onClose }) => {
  const avatar = authorData?.avatar || authorData?.profile_image || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const username = authorData?.username || "Unknown User";
  
  // Достаем ID автора, чтобы сформировать ссылку
  const authorId = authorData?._id;

  return (
    <div className={s.header}>
      {/* 1. Аватарка теперь кликабельная */}
      <Link to={`/profile/${authorId}`} onClick={onClose}>
        <img src={avatar} alt={username} style={{ cursor: 'pointer' }} />
      </Link>

      {/* 2. Имя теперь тоже кликабельная ссылка */}
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
         <button className={s.moreBtn} onClick={onShowOptions}><AiOutlineMore /></button>
      )}
    </div>
  );
};

export default PostHeader;