// frontend\src\components\PostModal\PostImage.jsx

import React from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai'; 
import s from './PostModal.module.scss';

const PostImage = ({ post, isEditing, previewUrl, onFileChange }) => {
  // Определяем картинку
  const currentImage = previewUrl || post.image || post.imageUrl;

  return (
    <div className={s.mediaSection}>
      <img src={currentImage} alt="Post" />
      
      {/* Кнопка загрузки (только при редактировании) */}
      {isEditing && (
        <label className={s.uploadOverlay}>
            <AiOutlineCloudUpload size={24} />
            <span>Change Photo</span>
            <input type="file" onChange={onFileChange} accept="image/*" hidden />
        </label>
      )}

      {!isEditing && post.title && (
        <div className={s.imageOverlayTitle}>
            <span>{post.title}</span>
        </div>
      )}
    </div>
  );
};

export default PostImage;
