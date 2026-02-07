// frontend/src/components/PostModal/PostModal.jsx

import React, { useState, useEffect, useRef } from 'react';
import { AiOutlineClose, AiOutlineHeart, AiFillHeart, AiOutlineMessage, AiOutlineMore, AiOutlineSmile } from 'react-icons/ai';
import { BsBookmark, BsEmojiSmile } from 'react-icons/bs';
import { FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast'; 
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { useDeletePostMutation, useUpdatePostMutation, useGetPostByIdQuery } from '../../services/api'; 
import { usePostLike } from '../../hooks/usePostLike';
import s from './PostModal.module.scss';

const PostModal = ({ post: initialPost, onClose }) => { 
  
  // 1. Хуки API (всегда наверху)
  const { data: freshPost, isSuccess } = useGetPostByIdQuery(initialPost?._id, {
     skip: !initialPost?._id, 
  });

  // 2. Вычисляем post (может быть undefined, но это не страшно для JS-логики)
  const post = isSuccess && freshPost ? freshPost : initialPost;

  // 3. 🔥 ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ЗДЕСЬ (ДО return)
  
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const [showEmoji, setShowEmoji] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const emojiPickerRef = useRef(null);

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

  // Наш кастомный хук (он внутри умеет обрабатывать null/undefined, мы это проверяли)
  const { isLiked, likesCount, handleLike } = usePostLike(post);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmoji) {
        if (
          emojiPickerRef.current && 
          !emojiPickerRef.current.contains(event.target) &&
          !event.target.closest(`.${s.emojiBtn}`)
        ) {
          setShowEmoji(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmoji]);

  // 4. 🔥 И ТОЛЬКО ТЕПЕРЬ ПРОВЕРЯЕМ, ЕСТЬ ЛИ ПОСТ
  // Если поста нет — выходим, но хуки выше уже "зарегистрированы" React-ом
  if (!post) return null; 

  // --- ЛОГИКА ФУНКЦИЙ ---

  const currentUserId = localStorage.getItem('userId');
  const postUser = post.user || post.author;
  const authorId = postUser?._id || postUser?.id || postUser;
  const authorName = postUser?.username || "User";
  const authorAvatar = postUser?.avatar || postUser?.profile_image || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const isMyPost = String(currentUserId) === String(authorId);

  const onEmojiClick = (emojiData, field) => {
    if (field === 'title') {
        setEditTitle(prev => prev + emojiData.emoji);
    } else {
        setEditContent(prev => prev + emojiData.emoji);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deletePost(post._id).unwrap();
        toast.success("Post deleted");
        onClose();
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error("Error deleting post");
      }
    }
    setShowOptions(false);
  };

  const handleEdit = () => {
    setEditContent(post.description || post.content || ""); 
    setEditTitle(post.title || "");
    setIsEditing(true); 
    setShowOptions(false);
    setActiveField(null);
  };

  const handleSaveEdit = async () => {
    try {
      await updatePost({ 
        id: post._id, 
        content: editContent,
        title: editTitle      
      }).unwrap();
      
      toast.success("Post updated!");
      setIsEditing(false);
      setShowEmoji(false);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update post");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setShowEmoji(false);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied");
    setShowOptions(false);
  };

  // --- JSX ---
  return (
    <div className={s.overlay} onClick={onClose}>
      <button className={s.closeBtn} onClick={onClose}>
        <AiOutlineClose />
      </button>

      <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
        
        {/* --- ЛЕВАЯ ЧАСТЬ (ФОТО) --- */}
        <div className={s.mediaSection}>
          <img src={post.image || post.imageUrl} alt="Post" />
          
          {(post.title || isEditing) && (
            <div className={s.imageOverlayTitle}>
              {isEditing ? (
                  <div className={s.editTitleWrapper}>
                      <input 
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className={s.overlayInput}
                        placeholder="Edit title..."
                        onFocus={() => {
                            setActiveField('title');
                            if (activeField !== 'title') setShowEmoji(false);
                        }}
                      />
                      
                      {activeField === 'title' && (
                        <div className={`${s.tools} ${s.overlayTools}`}>
                            <div 
                                className={s.emojiBtn} 
                                onClick={(e) => { e.stopPropagation(); setShowEmoji(!showEmoji); }}
                            >
                                <AiOutlineSmile />
                            </div>
                            <span className={s.counter}>{editTitle.length}/50</span>
                            
                            {showEmoji && (
                                <div className={s.emojiPickerPopover} ref={emojiPickerRef}>
                                    <EmojiPicker 
                                        onEmojiClick={(data) => onEmojiClick(data, 'title')} 
                                        emojiStyle={EmojiStyle.NATIVE}
                                        width={300} height={350} searchDisabled 
                                    />
                                </div>
                            )}
                        </div>
                      )}
                  </div>
              ) : (
                  <span>{post.title}</span>
              )}
            </div>
          )}
        </div>

        {/* --- ПРАВАЯ ЧАСТЬ (ИНФО) --- */}
        <div className={s.contentSection}>
          
          <div className={s.header}>
            <img src={authorAvatar} alt={authorName} />
            <span className={s.username}>{authorName}</span>
            
            {isEditing ? (
               <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
                  <button 
                    onClick={handleCancelEdit}
                    style={{ background: 'none', border: 'none', color: '#262626', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    disabled={isUpdating}
                    style={{ background: 'none', border: 'none', color: '#0095f6', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
                  >
                    {isUpdating ? 'Saving...' : 'Done'}
                  </button>
               </div>
            ) : (
               <button className={s.moreBtn} onClick={() => setShowOptions(true)}>
                 <AiOutlineMore />
               </button>
            )}
          </div>

          <div className={isEditing ? s.editorContainer : s.commentsList}>
            
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className={s.editTextArea}
                  placeholder="Write a caption..."
                  onFocus={() => {
                      setActiveField('content');
                      if (activeField !== 'content') setShowEmoji(false);
                  }}
                />

                {activeField === 'content' && (
                  <div className={s.tools}>
                      <div 
                        className={s.emojiBtn} 
                        onClick={(e) => { e.stopPropagation(); setShowEmoji(!showEmoji); }}
                      >
                        <AiOutlineSmile />
                      </div>
                      <span className={s.counter}>{editContent.length}/2,200</span>
                      
                      {showEmoji && (
                          <div className={`${s.emojiPickerPopover} ${s.popoverUp}`} ref={emojiPickerRef}>
                              <EmojiPicker 
                                onEmojiClick={(data) => onEmojiClick(data, 'content')} 
                                emojiStyle={EmojiStyle.NATIVE}
                                width={300} height={350} searchDisabled 
                              />
                          </div>
                      )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className={s.commentItem}>
                  <img src={authorAvatar} alt={authorName} />
                  <div className={s.commentContent}>
                    <span className={s.commentUsername}>{authorName}</span>
                    <span className={s.commentText}>
                        {post.description || post.content || ""}
                    </span>
                    <span className={s.commentTime}>
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {!isEditing && (
            <div className={s.footer}>
              <div className={s.actionIcons}>
                
                {/* ИНТЕРАКТИВНЫЙ ЛАЙК */}
                <div onClick={handleLike} style={{ cursor: 'pointer' }}>
                  {isLiked ? (
                    <AiFillHeart color="#ed4956" /> 
                  ) : (
                    <AiOutlineHeart /> 
                  )}
                </div>

                <AiOutlineMessage /> 
                <FiSend />
                <div style={{ marginLeft: 'auto' }}><BsBookmark /></div>
              </div>

              {/* ДИНАМИЧЕСКИЙ СЧЕТЧИК */}
              <div className={s.likesCount}>
                 {likesCount} {likesCount === 1 ? 'like' : 'likes'}
              </div>

              <div className={s.postDate}>
                 {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now"}
              </div>
              <div className={s.addCommentBox}>
                <BsEmojiSmile size={24} color="#8e8e8e" />
                <input type="text" placeholder="Add a comment..." />
                <button disabled>Post</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showOptions && (
        <div className={s.optionsOverlay} onClick={() => setShowOptions(false)}>
          <div className={s.optionsCard} onClick={(e) => e.stopPropagation()}>
            {isMyPost && (
              <>
                <button className={`${s.optionBtn} ${s.dangerBtn}`} onClick={handleDelete} disabled={isDeleting}>Delete</button>
                <button className={s.optionBtn} onClick={handleEdit}>Edit</button>
              </>
            )}
            <button className={s.optionBtn} onClick={() => setShowOptions(false)}>Go to post</button>
            <button className={s.optionBtn} onClick={handleCopyLink}>Copy link</button>
            <button className={s.optionBtn} onClick={() => setShowOptions(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostModal;