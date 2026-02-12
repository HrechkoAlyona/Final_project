// frontend\src\components\PostModal\PostActions.jsx

import React, { useState, useRef, useEffect } from 'react'; 
import { AiOutlineHeart, AiFillHeart, AiOutlineMessage } from 'react-icons/ai';
import { FiSend } from 'react-icons/fi';
import { BsBookmark, BsEmojiSmile } from 'react-icons/bs';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import toast from 'react-hot-toast';
import { useAddCommentMutation } from '../../services/api';
import { usePostActions } from '../../hooks/usePostActions'; 
import s from './PostModal.module.scss';
import { formatDate } from '../../utils/dateUtils';

const PostActions = ({ post }) => {
  const [commentText, setCommentText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation();
  
  const emojiRef = useRef(null);
  const { isLiked, likesCount, handleLike } = usePostActions(post);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment({ postId: post._id, text: commentText }).unwrap();
      setCommentText("");
      toast.success("Comment added!");
      setShowEmoji(false);
    } catch {
      toast.error("Failed to post comment");
    }
  };

  return (
    <div className={s.footer}>
      <div className={s.actionIcons}>
        <div onClick={handleLike} style={{ cursor: 'pointer' }}>
          {isLiked ? <AiFillHeart color="#ed4956" /> : <AiOutlineHeart />}
        </div>
        <AiOutlineMessage /> 
        <FiSend />
        <div style={{ marginLeft: 'auto' }}><BsBookmark /></div>
      </div>

      <div className={s.likesCount}>{likesCount} likes</div>
      
      {/* --- formatDate --- */}
      <div className={s.postDate}>{formatDate(post.createdAt)}</div>
      
      <form className={s.addCommentBox} onSubmit={handlePostComment}>
        <div ref={emojiRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div className={s.emojiBtn} onClick={() => setShowEmoji(!showEmoji)}>
               <BsEmojiSmile size={24} color="#8e8e8e" />
            </div>
            
           {showEmoji && (
                <div className={s.emojiPickerPopover}>
                    <EmojiPicker 
                        onEmojiClick={(e) => setCommentText(prev => prev + e.emoji)} 
                        emojiStyle={EmojiStyle.NATIVE} 
                        width={280} 
                        height={300} 
                        searchDisabled={true}
                        skinTonesDisabled={true}
                        previewConfig={{ showPreview: false }}
                    />
                </div>
            )}
        </div>

        <input 
          type="text" 
          placeholder="Add a comment..." 
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={isCommenting}
        />
        <button type="submit" disabled={!commentText.trim() || isCommenting}>
          {isCommenting ? '...' : 'Post'}
        </button>
      </form>
    </div>
  );
};

export default PostActions;