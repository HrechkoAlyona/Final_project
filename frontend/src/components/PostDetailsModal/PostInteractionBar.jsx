import React from 'react';
import { AiOutlineHeart, AiOutlineMessage, AiOutlineSend, AiOutlineBook } from 'react-icons/ai';
import s from './PostDetailsModal.module.scss';

const PostInteractionBar = ({ post }) => {
  return (
    <div className={s.interactionBar}>
      <div className={s.iconsRow}>
        <div className={s.leftIcons}>
          <AiOutlineHeart />
          <AiOutlineMessage />
          <AiOutlineSend />
        </div>
        <div className={s.saveIcon}>
          <AiOutlineBook />
        </div>
      </div>
      
      <div className={s.likesCount}>
        {post?.like_count || 0} likes
      </div>
      
      <div className={s.date}>
        2 DAYS AGO
      </div>
    </div>
  );
};

export default PostInteractionBar;