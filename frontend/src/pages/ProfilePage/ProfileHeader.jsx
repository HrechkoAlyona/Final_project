// frontend\src\pages\ProfilePage\ProfileHeader.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Ring from '../../components/logos/Ring';
import FollowButton from '../../components/FollowButton/FollowButton';
import UserListModal from '../../components/UserListModal/UserListModal'; // <--- 1. ИМПОРТ
import s from './ProfilePage.module.scss';

const ProfileHeader = ({ user, isMyProfile, onMessageClick }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 2. Стейт для управления модальным окном
  // Может быть null, 'followers' или 'following'
  const [activeModal, setActiveModal] = useState(null);

  const MAX_LENGTH = 107;

  if (!user) return null;

  const bioText = user.bio || '';
  const shouldTruncate = bioText.length > MAX_LENGTH && !isExpanded;
  const textToDisplay = shouldTruncate ? bioText.slice(0, MAX_LENGTH) : bioText;
  const getFullUrl = (url) => (!url ? '' : url.startsWith('http') ? url : `https://${url}`);

  return (
    <>
      <header className={s.header}>
        <div className={s.avatarWrapper}>
          <Ring />
          <img 
            src={user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
            alt="avatar" 
            className={s.avatarImg}
          />
        </div>

        <div className={s.details}>
          <div className={s.topRow}>
            <h2>{user.username}</h2>

            {isMyProfile ? (
              <button 
                className={s.editButton}
                onClick={() => navigate('/edit-profile')}
              >
                Edit profile
              </button>
            ) : (
              <div className={s.actionsRow}> 
                <FollowButton targetUser={user} size="medium" />
                <button 
                  className={s.messageButton} 
                  onClick={onMessageClick}
                >
                  Message
                </button>
              </div>
            )}
          </div>

          <div className={s.stats}>
            <span><strong>{user.posts?.length || 0}</strong> posts</span>
            
            {/* 3. Делаем Followers кликабельным */}
            <span 
                style={{ cursor: 'pointer' }} 
                onClick={() => setActiveModal('followers')}
                title="View Followers"
            >
                <strong>{user.followersCount || 0}</strong> followers
            </span>
            
            {/* 4. Делаем Following кликабельным */}
            <span 
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveModal('following')}
                title="View Following"
            >
                <strong>{user.followingCount || 0}</strong> following
            </span>
          </div>

          <div className={s.bioSection}>
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {textToDisplay}
              {shouldTruncate && (
                <>
                  ... 
                  <span 
                    className={s.moreLink} 
                    onClick={() => setIsExpanded(true)}
                    style={{ color: '#8e8e8e', cursor: 'pointer', marginLeft: '5px' }}
                  >
                    more
                  </span>
                </>
              )}
            </div>

            {user.website && (
              <a 
                href={getFullUrl(user.website)} 
                target="_blank" 
                rel="noopener noreferrer"
                className={s.websiteLink}
              >
                {user.website}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 5. ОТРИСОВКА МОДАЛКИ (если activeModal не null) */}
      {activeModal && (
        <UserListModal 
            userId={user._id}
            type={activeModal} // 'followers' или 'following'
            title={activeModal === 'followers' ? 'Followers' : 'Following'}
            onClose={() => setActiveModal(null)}
        />
      )}
    </>
  );
};

export default ProfileHeader;