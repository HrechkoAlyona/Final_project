// frontend\src\components\FollowButton\FollowButton.jsx
import React from 'react';
import { useFollow } from '../../hooks/useFollow';
import s from './FollowButton.module.scss';

const FollowButton = ({ targetUser, size = 'medium' }) => {
  
  const { isFollowing, handleFollow, isLoading } = useFollow(targetUser);

  return (
    <button
      className={`${s.followButton} ${isFollowing ? s.unfollow : ''} ${s[size]}`}
      onClick={handleFollow}
      disabled={isLoading}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
