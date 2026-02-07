import React from 'react';
import { AiOutlineEllipsis } from 'react-icons/ai';
import s from './PostDetailsModal.module.scss';

const PostTopBar = ({ post }) => {
  const username = post?.author?.username || "username";
  const avatar = post?.author?.profile_image || "https://via.placeholder.com/150";
  const isMyPost = false; // Логика позже

  return (
    <div className={s.topBar}>
      <div className={s.authorInfo}>
        <img src={avatar} alt={username} />
        <a href={`/profile/${username}`} className={s.username}>{username}</a>
        
        {!isMyPost && (
          <>
            <span className={s.dot}>•</span>
            <span className={s.followBtn}>Follow</span>
          </>
        )}
      </div>

      <div className={s.moreBtn}>
        <AiOutlineEllipsis />
      </div>
    </div>
  );
};

export default PostTopBar;