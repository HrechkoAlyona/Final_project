import React, { useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { AiOutlineClose, AiOutlineArrowLeft, AiOutlineSmile } from 'react-icons/ai';
import { BiCloudUpload } from "react-icons/bi";
import { useCreatePostForm } from '../../hooks/useCreatePostForm';
import { useGetMeQuery } from '../../services/api'; 
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

  const { data: user } = useGetMeQuery();

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

  const handleSectionClick = () => {
    if (!preview) fileInputRef.current?.click();
  };

  const userAvatar = user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const userName = user?.username || "User";

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
                <img src={userAvatar} alt="avatar" />
                <span>{userName}</span>
            </div>

            {/*  1. ЗАГОЛОВОК */}
            <div className={s.inputGroup}>
                <textarea 
                    placeholder="Add a headline..." 
                    className={s.titleInput}
                    {...register('title', { maxLength: 100 })}
                    autoComplete="off"
                    rows={2} // Начальная высота
                    onFocus={() => {
                        setActiveField('title');
                        if (activeField !== 'title') setShowEmoji(false); 
                    }}
                />
                
                {activeField === 'title' && (
                  <div className={s.tools}>
                      <div 
                        className={s.emojiBtn} 
                        onClick={(e) => { e.stopPropagation(); setShowEmoji(!showEmoji); }}
                      >
                          <AiOutlineSmile />
                      </div>
                      <span className={s.counter}>{titleValue?.length || 0}/100</span>
                      
                      {showEmoji && (
                          <div className={s.emojiPickerPopover} ref={emojiPickerRef}>
                              <EmojiPicker 
                                onEmojiClick={(data) => onEmojiClick(data, 'title')} 
                                searchDisabled={true}
                                skinTonesDisabled={true}
                                previewConfig={{ showPreview: false }}
                                width={280} 
                                height={300} 
                                emojiStyle="native"
                              />
                          </div>
                      )}
                  </div>
                )}
            </div>

            {/*  2. ОПИСАНИЕ */}
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
                        onClick={(e) => { e.stopPropagation(); setShowEmoji(!showEmoji); }}
                      >
                        <AiOutlineSmile />
                      </div>
                      <span className={s.counter}>{captionValue?.length || 0}/2,200</span>
                      
                      {showEmoji && (
                          <div className={`${s.emojiPickerPopover} ${s.popoverUp}`} ref={emojiPickerRef}>
                              <EmojiPicker 
                                onEmojiClick={(data) => onEmojiClick(data, 'content')} 
                                searchDisabled={true}
                                skinTonesDisabled={true}
                                previewConfig={{ showPreview: false }}
                                width={280} 
                                height={300} 
                                emojiStyle="native"
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