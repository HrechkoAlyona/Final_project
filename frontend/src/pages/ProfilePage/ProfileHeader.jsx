import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFollow } from '../../hooks/useFollow'; // 🔥 Подключаем хук
import s from './ProfilePage.module.scss'; // Используем те же стили

const ProfileHeader = ({ user, isMyProfile }) => {
  const navigate = useNavigate();
  
  // 🔥 Хук подписки (работает, только если это чужой профиль)
  const { isFollowing, followersCount, handleFollow } = useFollow(user);

  if (!user) return null;

  return (
    <header className={s.header}>
      <div className={s.avatar}>
        <img 
          src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
          alt="avatar" 
        />
      </div>
      
      <div className={s.details}>
        <div className={s.topRow}>
          <h2>{user.username}</h2>
          
          {/* 🔥 ЛОГИКА КНОПОК */}
          {isMyProfile ? (
            <button 
              className={s.editButton}
              onClick={() => navigate('/edit-profile')}
            >
              Edit profile
            </button>
          ) : (
            <button 
              className={`${s.followButton} ${isFollowing ? s.unfollow : ''}`}
              onClick={handleFollow}
              style={{
                 backgroundColor: isFollowing ? '#efefef' : '#0095f6',
                 color: isFollowing ? 'black' : 'white',
                 border: 'none',
                 padding: '5px 20px',
                 borderRadius: '4px',
                 fontWeight: '600',
                 cursor: 'pointer'
              }}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>

        <div className={s.stats}>
           {/* Используем user.posts.length для постов */}
           <span><strong>{user.posts?.length || 0}</strong> posts</span>
           
           {/* 🔥 Используем данные из хука для подписчиков (чтобы цифра менялась сразу) */}
           <span><strong>{followersCount}</strong> followers</span>
           
           {/* Для подписок берем из user, так как мы не меняем это число кликом тут */}
           <span><strong>{user.followingCount || 0}</strong> following</span>
        </div>

        <div className={s.bioSection}>
          <div className={s.realName}>{user.fullName}</div>
          <div>{user.bio}</div>
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;