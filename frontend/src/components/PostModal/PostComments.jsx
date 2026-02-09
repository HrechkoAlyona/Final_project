// frontend\src\components\PostModal\PostComments.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { AiOutlineSmile } from 'react-icons/ai';
import s from './PostModal.module.scss';

// 🔥 Принимаем onClose в пропсах
const PostComments = ({ post, authorData, isEditing, editContent, setEditContent, onClose }) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const avatar = authorData?.avatar || authorData?.profile_image || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const username = authorData?.username || "Unknown User";
  
  // ID автора поста для ссылки
  const authorId = authorData?._id || post.user?._id || post.user;

  return (
    <div className={isEditing ? s.editorContainer : s.commentsList}>
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className={s.editTextArea}
            placeholder="Write a caption..."
          />
          <div className={s.tools}>
              <div className={s.emojiBtn} onClick={() => setShowEmoji(!showEmoji)}><AiOutlineSmile /></div>
              {showEmoji && (
                  <div className={`${s.emojiPickerPopover} ${s.popoverUp}`}>
                      <EmojiPicker onEmojiClick={(e) => setEditContent(prev => prev + e.emoji)} emojiStyle={EmojiStyle.NATIVE} width={300} height={350} />
                  </div>
              )}
          </div>
        </div>
      ) : (
        <>
          {/* Описание поста (Caption) */}
          <div className={s.commentItem}>
            <img src={avatar} alt={username} />
            <div className={s.commentContent}>
              {/* 🔥 Добавляем onClick={onClose} */}
              <Link 
                to={`/profile/${authorId}`} 
                className={s.commentUsername}
                onClick={onClose}
              >
                {username}
              </Link>
              <span className={s.commentText}>{post.description || post.content || ""}</span>
              <div className={s.commentTime}>{new Date(post.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
          
          {/* Список комментариев */}
          {post.comments?.map((comment, index) => (
             <div key={comment._id || index} className={s.commentItem}>
                <img src={comment.user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="user" />
                <div className={s.commentContent}>
                  
                  {/* 🔥 Добавляем onClick={onClose} */}
                  <Link 
                    to={`/profile/${comment.user?._id}`} 
                    className={s.commentUsername}
                    onClick={onClose}
                  >
                    {comment.user?.username || "User"}
                  </Link>

                  <span className={s.commentText}>{comment.text}</span>
                </div>
             </div>
          ))}
        </>
      )}
    </div>
  );
};

export default PostComments;