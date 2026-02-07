import React from 'react';
import s from './ProfilePage.module.scss';

const ProfileGallery = ({ posts, onPostClick }) => {
  
  // Если постов нет
  if (!posts || posts.length === 0) {
    return (
      <div className={s.emptyState}>
         <h3>Share Photos</h3>
         <p>When you share photos, they will appear on your profile.</p>
      </div>
    );
  }

  return (
    <div className={s.gallery}>
      {posts.map((post) => (
        <div 
          key={post._id} 
          className={s.galleryItem}
          onClick={() => onPostClick(post)}
        >
          <img src={post.image} alt="post" />

          {post.title && (
            <div className={s.gridTitleOverlay}>
              {post.title}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProfileGallery;