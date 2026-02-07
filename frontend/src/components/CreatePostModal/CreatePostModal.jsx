// frontend/src/components/CreatePostModal/CreatePostModal.jsx

import React, { useRef, useState, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { AiOutlineClose, AiOutlineArrowLeft, AiOutlineSmile } from 'react-icons/ai';
import { BiCloudUpload } from "react-icons/bi";
import { useCreatePostForm } from '../../hooks/useCreatePostForm';
import s from './CreatePostModal.module.scss';

const CreatePostModal = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    isLoading,
    preview,
    captionValue,
    titleValue, 
    showEmoji,
    setShowEmoji,
    handleFileSelect,
    onEmojiClick,
    submitPost,
    resetForm,
    setActiveField,
    activeField 
  } = useCreatePostForm(onClose);

  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Закрытие смайлов по клику вне
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
  }, [showEmoji, setShowEmoji]);

  const [userData, setUserData] = useState(() => {
    const localUsername = localStorage.getItem('username');
    const localAvatar = localStorage.getItem('avatar');
    return { username: localUsername || "User", avatar: localAvatar || null };
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (userData.username !== "User") return;
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        const userId = decoded.id; 
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const user = await response.json();
          setUserData({ 
            username: user.username || "User", 
            avatar: user.avatar || null 
          });
        }
      } catch (error) { console.error(error); }
    };
    fetchUserData();
  }, [userData.username]);

  const handleSectionClick = () => {
    if (!preview) fileInputRef.current?.click();
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <button className={s.closeBtn} onClick={onClose}><AiOutlineClose /></button>

      <div className={s.modalCard} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <header className={s.header}>
          {preview ? (
            <button className={s.backBtn} onClick={resetForm}><AiOutlineArrowLeft /></button>
          ) : (<div style={{ width: 24 }}></div>)}
          <h3>Create new post</h3>
          <button className={s.navBtn} onClick={handleSubmit(submitPost)} disabled={isLoading || !preview}>
            {isLoading ? 'Sharing...' : 'Share'}
          </button>
        </header>

        {/* Body */}
        <div className={s.body}>
          
          {/* LEFT COLUMN */}
          <div className={`${s.mediaSection} ${preview ? s.active : ''}`} onClick={handleSectionClick} style={{ cursor: preview ? 'default' : 'pointer' }}>
            {preview ? (
              <>
                <img src={preview} alt="Selected" />
                {titleValue && <div className={s.previewTitleOverlay}>{titleValue}</div>}
              </>
            ) : (
              <div className={s.uploadPlaceholder}>
                <BiCloudUpload size={120} color="#262626" />
                <div className={s.selectLabel}>Select from computer</div>
              </div>
            )}
            <input type="file" hidden accept="image/*" ref={fileInputRef} onChange={handleFileSelect} onClick={(e) => e.stopPropagation()} />
          </div>

          {/* RIGHT COLUMN */}
          <div className={s.formSection}>
            <div className={s.userInfo}>
                <img src={userData.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="avatar" onError={(e) => e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"}/>
                <span>{userData.username}</span>
            </div>

            {/* --- 1. ЗАГОЛОВОК --- */}
            <div className={s.inputGroup}>
                <input 
                    type="text" 
                    placeholder="Add a headline..." 
                    className={s.titleInput}
                    {...register('title', { maxLength: 50 })}
                    autoComplete="off"
                    onFocus={() => {
                        setActiveField('title');
                        if (activeField !== 'title') setShowEmoji(false); 
                    }}
                />
                
                {activeField === 'title' && (
                  <div className={s.tools}>
                      <div 
                        className={s.emojiBtn} 
                        onClick={(e) => {
                           e.stopPropagation(); 
                           setShowEmoji(!showEmoji);
                        }}
                      >
                          <AiOutlineSmile />
                      </div>
                      <span className={s.counter}>{titleValue?.length || 0}/50</span>
                      
                      {showEmoji && (
                          <div className={s.emojiPickerPopover} ref={emojiPickerRef}>
                              <EmojiPicker 
                                onEmojiClick={(data) => onEmojiClick(data, 'title')} 
                                width={300} height={350} searchDisabled 
                              />
                          </div>
                      )}
                  </div>
                )}
            </div>

            {/* --- 2. ОПИСАНИЕ --- */}
            <div className={s.inputGroup} style={{ flex: 1 }}>
                <textarea 
                  className={s.captionInput}
                  placeholder="Write a caption..."
                  {...register('content', { maxLength: 2200 })}
                  onFocus={() => {
                      setActiveField('content');
                      if (activeField !== 'content') setShowEmoji(false);
                  }}
                />
                
                {activeField === 'content' && (
                  <div className={s.tools}>
                      <div 
                        className={s.emojiBtn} 
                        onClick={(e) => {
                          e.stopPropagation(); 
                          setShowEmoji(!showEmoji);
                        }}
                      >
                        <AiOutlineSmile />
                      </div>
                      <span className={s.counter}>{captionValue?.length || 0}/2,200</span>
                      
                      {showEmoji && (
                          <div 
                            className={`${s.emojiPickerPopover} ${s.popoverUp}`} 
                            ref={emojiPickerRef}
                          >
                              <EmojiPicker 
                                onEmojiClick={(data) => onEmojiClick(data, 'content')} 
                                width={300} height={350} searchDisabled 
                              />
                          </div>
                      )}
                  </div>
                )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;