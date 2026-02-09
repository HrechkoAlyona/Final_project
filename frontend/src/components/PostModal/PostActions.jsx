// frontend\src\components\PostModal\PostActions.jsx

import React, { useState } from 'react';
import { AiOutlineHeart, AiFillHeart, AiOutlineMessage } from 'react-icons/ai';
import { FiSend } from 'react-icons/fi';
import { BsBookmark, BsEmojiSmile } from 'react-icons/bs';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import toast from 'react-hot-toast';
import { useAddCommentMutation } from '../../services/api';
import { usePostActions } from '../../hooks/usePostActions'; // Используем наш общий хук
import s from './PostModal.module.scss';

const PostActions = ({ post }) => {
  const [commentText, setCommentText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [addComment, { isLoading: isCommenting }] = useAddCommentMutation();
  
  // Хук действий (лайки)
  const { isLiked, likesCount, handleLike } = usePostActions(post);

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
      <div className={s.postDate}>{new Date(post.createdAt).toLocaleDateString()}</div>
      
      <form className={s.addCommentBox} onSubmit={handlePostComment}>
        <div className={s.emojiBtn} onClick={() => setShowEmoji(!showEmoji)}>
           <BsEmojiSmile size={24} color="#8e8e8e" />
        </div>
        
        {showEmoji && (
            <div className={`${s.emojiPickerPopover} ${s.popoverUp}`} style={{left: '0'}}>
                <EmojiPicker onEmojiClick={(e) => setCommentText(prev => prev + e.emoji)} emojiStyle={EmojiStyle.NATIVE} width={300} height={350} />
            </div>
        )}

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