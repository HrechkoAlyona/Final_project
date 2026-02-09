// frontend\src\pages\ProfilePage\ProfileHeader.jsx
// frontend/src/pages/ProfilePage/ProfileHeader.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Ring from '../../components/logos/Ring';
import FollowButton from '../../components/FollowButton/FollowButton';
import s from './ProfilePage.module.scss';

const ProfileHeader = ({ user, isMyProfile }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 107;

  if (!user) return null;

  const bioText = user.bio || '';
  const shouldTruncate = bioText.length > MAX_LENGTH && !isExpanded;
  const textToDisplay = shouldTruncate ? bioText.slice(0, MAX_LENGTH) : bioText;

  const getFullUrl = (url) => (!url ? '' : url.startsWith('http') ? url : `https://${url}`);

  return (
    <header className={s.header}>
      {/* Аватар с кольцом */}
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
            <FollowButton targetUser={user} size="medium" />
          )}
        </div>

        <div className={s.stats}>
          <span><strong>{user.posts?.length || 0}</strong> posts</span>
          <span><strong>{user.followersCount || 0}</strong> followers</span>
          <span><strong>{user.followingCount || 0}</strong> following</span>
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
  );
};

export default ProfileHeader;
