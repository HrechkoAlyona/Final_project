// frontend\src\components\PostModal\PostImage.jsx
import React from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai'; 
import s from './PostModal.module.scss';

const PostImage = ({ post, isEditing, editTitle, setEditTitle, previewUrl, onFileChange }) => {

  // Определяем, какую картинку показывать: превью (если выбрали новую) или старую с сервера
  const currentImage = previewUrl || post.image || post.imageUrl;

  return (
    <div className={s.mediaSection}>
      <img src={currentImage} alt="Post" />
      
      {/* КНОПКА ЗАГРУЗКИ (Только при редактировании) */}
      {isEditing && (
        <label className={s.uploadOverlay}>
            <AiOutlineCloudUpload size={40} />
            <span>Change Photo</span>
            <input type="file" onChange={onFileChange} accept="image/*" hidden />
        </label>
      )}

      {/* Заголовок (Title) */}
      {(post.title || isEditing) && (
        <div className={s.imageOverlayTitle}>
          {isEditing ? (
            <div className={s.editTitleWrapper}>
              <textarea 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={s.overlayInput}
                placeholder="Edit title..."
                rows={4} 
              />
            </div>
          ) : (
            <span>{post.title}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default PostImage;