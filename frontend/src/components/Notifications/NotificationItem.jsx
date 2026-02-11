// frontend/src/components/Notifications/NotificationItem.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import FollowButton from '../FollowButton/FollowButton';
import s from './Notifications.module.scss';
import { formatShortTime } from '../../utils/dateUtils';

const NotificationItem = ({ notification, onClose }) => {
  const navigate = useNavigate();
  const { sender, type, post, createdAt, isRead, message } = notification;

  const handleRowClick = () => {
    if (sender?._id) {
      navigate(`/profile/${sender._id}`);
      onClose();
    }
  };

  const handlePostClick = (e) => {
    e.stopPropagation(); 
    if (post?._id) {
      navigate(`/post/${post._id}`);
      onClose();
    }
  };

  const getMessageText = () => {
    switch (type) {
      case 'like': return 'liked your photo.';
      case 'comment': return `commented: ${message || 'nice photo!'}`;
      case 'follow': return 'started following you.';
      case 'like_comment': return 'liked your comment.';
      default: return 'interacted with your post.';
    }
  };

  return (
    <div className={`${s.item} ${!isRead ? s.unread : ''}`} onClick={handleRowClick}>
      {/* Аватарка */}
      <div className={s.avatarWrapper}>
        <img
          src={sender?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
          alt="avatar"
          className={s.avatar}
        />
      </div>

      {/* Контент текста */}
      <div className={s.content}>
        <span className={s.username}>{sender?.username || 'User'}</span>
        
        {/* Текст уведомления */}
        <span className={s.text}> {getMessageText()} </span>
        
        {/* --- ВРЕМЯ (formatShortTime) ---  */}
        <span className={s.time} style={{ color: '#8e8e8e', marginLeft: '6px' }}>
          {formatShortTime(createdAt)}
        </span>
      </div>

      {/* Правая часть */}
      <div className={s.action}>
        {!isRead && <div className={s.unreadDot}></div>}

        {type === 'follow' ? (
          <div onClick={(e) => e.stopPropagation()}>
            <FollowButton targetUser={sender} size="small" />
          </div>
        ) : (
          post?.image && (
            <img
              src={post.image}
              alt="post thumb"
              className={s.postThumb}
              onClick={handlePostClick}
            />
          )
        )}
      </div>
    </div>
  );
};

export default NotificationItem;