import React, { useState, useRef } from 'react';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { AiOutlineSmile } from 'react-icons/ai';
import s from './PostModal.module.scss';

const PostImage = ({ post, isEditing, editTitle, setEditTitle }) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef(null);

  const onEmojiClick = (emojiData) => {
    setEditTitle(prev => prev + emojiData.emoji);
  };

  return (
    <div className={s.mediaSection}>
      <img src={post.image || post.imageUrl} alt="Post" />
      
      {(post.title || isEditing) && (
        <div className={s.imageOverlayTitle}>
          {isEditing ? (
            <div className={s.editTitleWrapper}>
              <input 
                type="text" value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={s.overlayInput}
                placeholder="Edit title..."
              />
              <div className={`${s.tools} ${s.overlayTools}`}>
                <div className={s.emojiBtn} onClick={() => setShowEmoji(!showEmoji)}>
                   <AiOutlineSmile />
                </div>
                {showEmoji && (
                   <div className={s.emojiPickerPopover} ref={emojiRef}>
                      <EmojiPicker onEmojiClick={onEmojiClick} emojiStyle={EmojiStyle.NATIVE} width={300} height={350} />
                   </div>
                )}
              </div>
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